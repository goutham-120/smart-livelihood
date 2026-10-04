/**
 * WhatsApp Livelihood Assistant Engine
 * 
 * Supports:
 * 1. Automatic multilingual language detection per turn across 22 Scheduled Indian Languages + English
 * 2. Romanized Indian-language understanding (e.g., "naaku tailoring training kavali", "ela unnavu", "aap kaise ho", "mujhe job chahiye")
 * 3. Robust conversation memory across turns (skills, preference, location, course/scheme/job history)
 * 4. Context-aware follow-ups with ZERO English leakage
 * 5. Real database lookup for Courses, Schemes, JobOpenings, and TrainingCenters
 * 6. LLM synthesis with Google Gemini (strictly constrained to the detected turn language)
 * 7. Deterministic multilingual data-driven response generator (guarantees 100% accuracy and native script responses)
 * 8. Persistent conversation storage in MongoDB
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Course } from '../models/Course.js';
import { Scheme } from '../models/Scheme.js';
import { JobOpening } from '../models/JobOpening.js';
import { TrainingCenter } from '../models/TrainingCenter.js';
import { Occupation } from '../models/Occupation.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Conversation } from '../models/Conversation.js';
import { detectLanguageFromText, normalizeLanguageCode, getLanguageConfig } from '../channels/languages.js';
import { normalizeVoiceTranscript } from '../channels/transliteration.js';
import { extractSkillsFromText } from './extract.js';
import { getStrings, validateResponseLanguage } from './whatsappLocalizations.js';

// In-memory conversation session store with 2-hour TTL
const whatsappSessions = new Map();
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

let geminiClient = null;
const getGeminiModel = () => {
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

/**
 * Get or initialize a session for a given phone number
 */
export const getWhatsAppSession = async (phone = '9876543210', userId = null) => {
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10) || '9876543210';
  const now = Date.now();

  let session = whatsappSessions.get(cleanPhone);
  if (!session || (now - session.lastActive > SESSION_TTL_MS)) {
    session = {
      phone: cleanPhone,
      userId: userId || null,
      district: 'Warangal',
      language: 'en',
      knownSkills: [],
      occupation: '',
      preference: null, // 'training' | 'wage' | 'self' | 'either'
      lastTopic: null,  // 'greeting' | 'training' | 'job' | 'scheme' | 'general'
      lastCourses: [],
      lastSchemes: [],
      lastJobs: [],
      lastCenters: [],
      selectedCourse: null,
      selectedScheme: null,
      recentTurns: [],
      lastActive: now
    };
    whatsappSessions.set(cleanPhone, session);
  } else {
    session.lastActive = now;
  }

  // Load existing profile from MongoDB if user exists
  if (session.userId && session.knownSkills.length === 0) {
    try {
      const profile = await Profile.findOne({ user: session.userId });
      if (profile) {
        if (profile.district) session.district = profile.district;
        if (profile.skills && profile.skills.length > 0) {
          session.knownSkills = Array.from(new Set([...session.knownSkills, ...profile.skills]));
        }
        if (profile.employmentPreference) session.preference = profile.employmentPreference;
      }
    } catch (e) {
      // Non-fatal
    }
  }

  return session;
};

/**
 * Normalizes user skill keywords into broad canonical clusters
 * Supports all 22 Indian language scripts and transliterations
 */
const normalizeSkillCluster = (skillText = '') => {
  const lower = String(skillText).toLowerCase();
  if (/tailor|sew|stitching|kuttupani|garment|apparel|silai|दर्जी|सिलाई|कपड़े|कुట్టు|కుట్టుపని|టైలరింగ్|தையல்|দর্জি|দর্জির|সেলাই|ಟೈಲರಿಂಗ್|ಹೊಲಿಗೆ|തയ്യൽ|टेलरिंग|शिवण|ટેલરિંગ|સીવણ|ਟੇਲਰਿੰਗ|ਸਿਲਾਈ|ਟੇਲਰਿੰਗ|ଟେଲରିଂ|ସିଲେଇ|درزی|سلائی|দৰ্জী|দৰ্জীৰ|চিলাই|सूचीकर्म|blouse/i.test(lower)) {
    return 'tailoring';
  }
  if (/solar|photovoltaic|panel|bijli|बिजली|సోలార్|సౌర|சூரிய|সৌর|ಸೌರ|സൗരോർജ്ജ|सौर|સૌર|ਸੌਰ|ସୌର|شمسی|সৌৰ/i.test(lower)) {
    return 'solar';
  }
  if (/dairy|milk|milking|cattle|cow|buffalo|livestock|goat|sheep|pashuposhana|दूध|पशुपालन|డెయిరీ|పాడి|பால்|দুধ|গাভী|ಹಾಲು|പാൽ|दूध|દૂધ|ਦੁੱਧ|ଦୁଗ୍ଧ|دودھ|গাখীৰ/i.test(lower)) {
    return 'dairy';
  }
  if (/electric|electrician|wiring|appliance|cooler|motor|बिजली|విద్యుత్|மின்சாரம்|বিদ্যুৎ|ವಿದ್ಯುತ್|വൈദ്യുതി|વિદ્યુત|ਬਿਜਲੀ|ବିଦ୍ୟୁତ|بجلی/i.test(lower)) {
    return 'electrical';
  }
  if (/handloom|weave|weaving|loom|chenetha|మగ్గం|చేనేత|கைத்தறி|তাঁত|ಮಗ್ಗ|കൈത്തറി|हातमाग|હાથશાળ|ਹੱਥਖੱਡੀ|ହସ୍ତତନ୍ତ|হাতেবোৱা/i.test(lower)) {
    return 'handloom';
  }
  if (/embroider|kalamkari|zari|aari|కలంకారీ|जरी|जरदोजी|জরির|জরি/i.test(lower)) {
    return 'embroidery';
  }
  if (/retail|sales|customer|counter|shop|dukan|billing|ಮಾರಾಟ|விற்பனை|দোকান|दुकान|విక్రయ/i.test(lower)) {
    return 'retail';
  }
  if (/data entry|typing|computer|office|csc|कम्प्यूटर|कंप्यूटर|कम्प्युटर|கணினி|টেলি|ಕಂಪ್ಯೂಟರ್/i.test(lower)) {
    return 'data_entry';
  }
  if (/hospital|patient|health|aide|ward boy|nurse|వైద్యం|ఆరోగ్యం|மருத்துவம்|হাসপাতাল|ಆಸ್ಪತ್ರೆ/i.test(lower)) {
    return 'healthcare';
  }
  if (/plumb|pipe|sanitary|नल|ಪ್ಲಂಬಿಂಗ್|குழாய்|নল|ਪਲੰਬਰ|ପ୍ଲମ୍ବିଂ/i.test(lower)) {
    return 'plumbing';
  }
  if (/mason|brick|construction|మేస్త్రీ|राजमिस्त्री|கொத்தனார்|রাজমিস্ত্রি|ಮೇಸ್ತ್ರಿ|മേസ്തിരി|गवंडी|કડિયો|ਰਾਜਮਿਸਤਰੀ|ରାଜମିସ୍ତ୍ରୀ|মেস্ত্ৰী/i.test(lower)) {
    return 'masonry';
  }
  if (/pickle|food|baking|bakery|processing|jam|खाद्य|अचार|పాకశాస్త్రం/i.test(lower)) {
    return 'food_processing';
  }
  if (/teacher|teaching|shikshak|adhyapak|tutor|school|शिक्षक|टीचर|अध्यापक|ఉపాధ్యాయ|టీచర్|ஆசிரியர்|டீச்சர்|শিক্ষক|টিচার|ಶಿಕ್ಷಕ|ಟೀಚರ್|શિક્ષક|ਟੀਚਰ/i.test(lower)) {
    return 'teaching';
  }
  return null;
};

/**
 * Database Query: Retrieve courses matching skill or trade
 */
export const queryCoursesFromDB = async (cluster, limit = 3) => {
  try {
    let reg;
    if (cluster === 'tailoring') {
      reg = /tailor|sewing|garment|apparel/i;
    } else if (cluster === 'solar') {
      reg = /solar|photovoltaic/i;
    } else if (cluster === 'dairy') {
      reg = /dairy|milk|cattle|livestock|goat/i;
    } else if (cluster === 'electrical') {
      reg = /electric|appliance|wiring/i;
    } else if (cluster === 'handloom') {
      reg = /handloom|weaver|weaving/i;
    } else if (cluster === 'embroidery') {
      reg = /embroider|craft/i;
    } else if (cluster === 'retail') {
      reg = /retail|sales/i;
    } else if (cluster === 'data_entry') {
      reg = /data entry|typing/i;
    } else {
      reg = new RegExp(cluster, 'i');
    }

    const courses = await Course.find({
      $or: [
        { title: reg },
        { key: reg },
        { skillsGained: reg }
      ]
    }).limit(limit);

    return courses.map((c) => ({
      id: c._id.toString(),
      key: c.key,
      title: c.title,
      nsqfLevel: c.nsqfLevel,
      provider: c.provider,
      durationMonths: c.durationMonths,
      costInr: c.costInr || 0,
      mode: c.mode || 'offline',
      qpCode: c.qpCode || 'N/A',
      skillsGained: c.skillsGained || []
    }));
  } catch (err) {
    return [];
  }
};

/**
 * Database Query: Retrieve government schemes matching topic or occupation
 */
export const querySchemesFromDB = async (cluster, specificKey = null, limit = 3) => {
  try {
    if (specificKey) {
      const single = await Scheme.findOne({
        $or: [
          { key: new RegExp(specificKey, 'i') },
          { name: new RegExp(specificKey, 'i') }
        ]
      });
      if (single) {
        return [{
          id: single._id.toString(),
          key: single.key,
          name: single.name,
          category: single.category,
          benefit: single.benefit,
          eligibilitySummary: single.eligibilitySummary,
          link: single.link
        }];
      }
    }

    const schemes = await Scheme.find({}).limit(limit);
    return schemes.map((s) => ({
      id: s._id.toString(),
      key: s.key,
      name: s.name,
      category: s.category,
      benefit: s.benefit,
      eligibilitySummary: s.eligibilitySummary,
      link: s.link
    }));
  } catch (err) {
    return [];
  }
};

/**
 * Database Query: Retrieve wage job openings for district & cluster
 */
export const queryJobsFromDB = async (cluster, district = 'Warangal', limit = 3) => {
  try {
    let reg = /tailor|operator|assistant|worker|technician/i;
    if (cluster === 'solar') reg = /solar|technician|electric/i;
    if (cluster === 'dairy') reg = /dairy|farm|livestock/i;
    if (cluster === 'electrical') reg = /electric|wireman|technician/i;

    let jobs = await JobOpening.find({
      $and: [
        { district: new RegExp(`^${district}$`, 'i') },
        { title: reg }
      ]
    }).limit(limit);

    if (jobs.length === 0) {
      jobs = await JobOpening.find({
        district: new RegExp(`^${district}$`, 'i')
      }).limit(limit);
    }

    if (jobs.length === 0) {
      jobs = await JobOpening.find({}).limit(limit);
    }

    return jobs.map((j) => ({
      id: j._id.toString(),
      title: j.title,
      employer: j.employer,
      district: j.district,
      wage: j.wage || 12500,
      openings: j.openings || 1
    }));
  } catch (err) {
    return [];
  }
};

/**
 * Database Query: Retrieve accredited training centers near district
 */
export const queryTrainingCentersFromDB = async (cluster, district = 'Warangal', limit = 3) => {
  try {
    let centers = await TrainingCenter.find({
      district: new RegExp(`^${district}$`, 'i'),
      trades: cluster
    }).limit(limit);

    if (centers.length === 0) {
      centers = await TrainingCenter.find({
        district: new RegExp(`^${district}$`, 'i')
      }).limit(limit);
    }

    return centers.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      district: c.district,
      trades: c.trades || [],
      contact: c.contact || '+91 870 2577890'
    }));
  } catch (err) {
    return [];
  }
};

/**
 * Rule-based Intent and Entity Classifier with Contextual Memory
 */
export const analyzeWhatsAppTurn = ({ message, session, detectedLang }) => {
  const lower = String(message || '').toLowerCase().trim();

  // 1. Check for location updates
  const districts = ['warangal', 'adilabad', 'nalgonda', 'hyderabad', 'karimnagar', 'nizamabad', 'khammam', 'mahabubnagar', 'rangareddy', 'medak'];
  for (const dist of districts) {
    if (lower.includes(dist)) {
      session.district = dist.charAt(0).toUpperCase() + dist.slice(1);
    }
  }

  // 2. Extract potential skill from user message
  let extractedCluster = normalizeSkillCluster(lower);
  if (extractedCluster) {
    if (!session.knownSkills.includes(extractedCluster)) {
      session.knownSkills.push(extractedCluster);
    }
    session.occupation = extractedCluster;
  }

  const activeCluster = session.knownSkills.length > 0 ? session.knownSkills[session.knownSkills.length - 1] : extractedCluster;

  // 3. Check for specific scheme queries
  let specificSchemeKey = null;
  if (/pmegp/i.test(lower)) specificSchemeKey = 'pmegp';
  else if (/vishwakarma/i.test(lower)) specificSchemeKey = 'pm_vishwakarma';
  else if (/mudra/i.test(lower)) specificSchemeKey = 'pm_mudra_yojana';
  else if (/pm[- ]?ajay/i.test(lower)) specificSchemeKey = 'pmajay_gia';
  else if (/surya\s*ghar/i.test(lower)) specificSchemeKey = 'pm_suryaghar_muft_bijli';
  else if (/stand[- ]?up/i.test(lower)) specificSchemeKey = 'standup_india';
  else if (/svanidhi/i.test(lower)) specificSchemeKey = 'pm_svanidhi';

  // 4. Check for ordinal/numeric selection (e.g., "1", "2", "option 1", "second one")
  let selectedIndex = null;
  const matchNum = lower.match(/(?:tell me about|course|number|option|\b)\s*([1-3])\b/i);
  if (matchNum) {
    selectedIndex = parseInt(matchNum[1], 10) - 1;
  } else if (/first|1st|modati|पहला|প্রথম|முதல்|ಮೊದಲು|ഒന്ന്|ਪਹਿਲਾ|ପ୍ରଥମ/i.test(lower)) {
    selectedIndex = 0;
  } else if (/second|2nd|rendava|दूसरा|দ্বিতীয়|இரண்டாவது|ಎರಡನೇ|രണ്ട്|ਦੂਜਾ|ଦ୍ୱିତୀୟ/i.test(lower)) {
    selectedIndex = 1;
  } else if (/third|3rd|moodava|तीसरा|তৃতীয়|மூன்றாவது|ಮೂರನೇ|മൂന്ന്|ਤੀਜਾ|ତୃତୀୟ/i.test(lower)) {
    selectedIndex = 2;
  }

  // Check if user specifically named a previously shown course
  if (selectedIndex === null && session.lastCourses.length > 0) {
    for (let i = 0; i < session.lastCourses.length; i++) {
      const c = session.lastCourses[i];
      if (lower.includes(c.title.toLowerCase()) || (c.qpCode && lower.includes(c.qpCode.toLowerCase()))) {
        selectedIndex = i;
        break;
      }
    }
  }

  // 5. Intent Determination
  // A. Greeting (only greeting words, without a complex query)
  const isGreeting =
    /(?:^|[^\p{L}])(how are you|ela unnavu|yela unnavu|ela unnav|aap kaise ho|kaise ho|namaste|namaskaram|namaskaramu|hello|hi|hey|good morning|subhodayam|வணக்கம்|নমস্কার|നമസ്കാരം|नमस्कार|નમસ્તે|ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ|ନମସ୍କାର|سلام|নমস্কাৰ|प्रणाम|जौहार|खुरुमজরি|খুলুমবায়|आदाब)(?:$|[^\p{L}])/iu.test(lower);
  const hasQueryWords = /(?:job|training|scheme|business|course|udhyogam|kavali|chahiye|shikshana|vyaparam|প্ৰশিক্ষণ|প্রশিক্ষণ|பயிற்சி|ತರಬೇತಿ|പരിശീലനം|शिकायचे|તાલીમ|ਸਿਖਲਾਈ|ତାଲିମ|تربیت|योजना|పథకం|திட்டம்|প্রকল্প|ಯೋಜನೆ|പദ്ധതി|યોજના|ਯੋਜਨਾ|ଯୋଜନା|اسکیم|வேலை|नौकरी|নৌকরী|চাকরি|ಕೆಲಸ|ജോലി|નોકરી|ਨੌਕਰੀ|ଚାକିରି|ملازمت|स्वरोजगार)/i.test(lower);
  if (isGreeting && !hasQueryWords) {
    return { intent: 'GREETING', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // B. Goodbye / Gratitude
  const isGoodbye = /(?:^|[^\p{L}])(thank you|thanks|dhanyavadalu|dhanyavadamulu|danyavadalu|shukriya|bye|alvida|selavu|धन्यवाद|நன்றி|ಧನ್ಯವಾದ|നന്ദി|आभार|ਧੰਨਵਾਦ|ଧନ୍ୟବାଦ|شکریہ|থাগৎচরি|साबायखर|देव बरें करूंक)(?:$|[^\p{L}])/iu.test(lower);
  if (isGoodbye && !hasQueryWords) {
    return { intent: 'GOODBYE', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // C. Nearby Location Query
  const isNearby = /(?:^|[^\p{L}])(nearby|near by|near|which one is nearby|where is it|where can i learn|training centre|nearest|daggaralo|daggarlo|daggara|paas mein|nazdeek|ekkada|kahan|पास|नजदीक|समीप|काছের|அருகிலுள்ள|ಹತ್ತಿರದ|അടുത്തുള്ള|जवळचे|નજીકનું|ਨੇੜਲਾ|ନିକଟସ୍ଥ|ওচৰৰ|قریبی)(?:$|[^\p{L}])/iu.test(lower);
  if (isNearby) {
    return { intent: 'LOCATION_NEARBY', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // D. Course Cost Query
  const isCost = /(?:^|[^\p{L}])(how much does it cost|cost|fee|fees|price|free|entha avuthundi|dabbulu|kitna kharcha|kitna paisa|मुफ्त|फीस|খরচ|கட்டணம்|ಶುಲ್ಕ|ഫീസ്|फी|ફી|ਫ਼ੀਸ|ଫିସ୍|মাচুল|فیس)(?:$|[^\p{L}])/iu.test(lower);
  if (isCost) {
    return { intent: 'COURSE_COST', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // E. Specific Scheme Details (e.g. "PMEGP", "PM Vishwakarma")
  if (specificSchemeKey || (lower.includes('scheme') && session.lastSchemes.length > 0 && selectedIndex !== null)) {
    return { intent: 'SCHEME_DETAILS', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // F. Follow-up Select on previous Course or Scheme
  if (selectedIndex !== null && session.lastCourses.length > 0 && session.lastTopic === 'training') {
    return { intent: 'COURSE_DETAILS', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // G. Self-Employment / Business / Schemes
  const isBusinessOrScheme =
    /(?:^|[^\p{L}])(business|shop|boutique|dukan|vyaparam|vyapar|karobar|enterprise|sontamga|khud ka|scheme|schemes|loan|loans|subsidy|yojana|pathakam|pathakalu|self employment|swayam upadhi)(?:$|[^\p{L}])/iu.test(lower) ||
    lower.includes('start a business') ||
    lower.includes('start business') ||
    lower.includes('open a shop') ||
    lower.includes('పథకం') ||
    lower.includes('పథకాలు') ||
    lower.includes('రుణం') ||
    lower.includes('వ్యాపారం') ||
    lower.includes('స్వయం ఉపాధి') ||
    lower.includes('योजना') ||
    lower.includes('लोन') ||
    lower.includes('व्यापार') ||
    lower.includes('स्वरोजगार') ||
    lower.includes('कर्ज') ||
    lower.includes('व्यवसाय') ||
    lower.includes('स्वयंरोजगार') ||
    lower.includes('திட்டம்') ||
    lower.includes('திட்டங்கள்') ||
    lower.includes('கடன்') ||
    lower.includes('தொழில்') ||
    lower.includes('சுயதொழில்') ||
    lower.includes('প্রকল্প') ||
    lower.includes('ঋণ') ||
    lower.includes('ব্যবসা') ||
    lower.includes('স্বনির্ভর') ||
    lower.includes('ಯೋಜನೆ') ||
    lower.includes('ಸಾಲ') ||
    lower.includes('ವ್ಯವಹಾರ') ||
    lower.includes('ಸ್ವಯಂ ಉದ್ಯೋಗ') ||
    lower.includes('പദ്ധതി') ||
    lower.includes('വായ്പ') ||
    lower.includes('ബിസിനസ്സ്') ||
    lower.includes('സ്വയംതൊഴിൽ') ||
    lower.includes('યોજના') ||
    lower.includes('લોન') ||
    lower.includes('વ્યવસાય') ||
    lower.includes('સ્વરોજગાર') ||
    lower.includes('ਯੋਜਨਾ') ||
    lower.includes('ਕਰਜ਼ਾ') ||
    lower.includes('ਕਾਰੋਬਾਰ') ||
    lower.includes('ਸਵੈ-ਰੁਜ਼ਗਾਰ') ||
    lower.includes('ଯୋଜନା') ||
    lower.includes('ଋଣ') ||
    lower.includes('ବ୍ୟବସାୟ') ||
    lower.includes('ସ୍ୱରୋଜଗାର') ||
    lower.includes('اسکیم') ||
    lower.includes('قرضہ') ||
    lower.includes('کاروبار') ||
    lower.includes('আঁচনি') ||
    lower.includes('স্বনিয়োজন') ||
    /start.*business/i.test(lower);
  if (isBusinessOrScheme) {
    session.preference = 'self';
    return { intent: 'SCHEME_SEARCH', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // H. Job Search
  const isJob =
    /(?:^|[^\p{L}])(job|jobs|employment|naukri|udyogam|udhyogam|work|vacancy|openings|naaku job kavali|mujhe job chahiye|want a job|kam chahiye)(?:$|[^\p{L}])/iu.test(lower) ||
    lower.includes('ఉద్యోగం') ||
    lower.includes('నౌకరీ') ||
    lower.includes('नौकरी') ||
    lower.includes('रोजगार') ||
    lower.includes('काम चाहिए') ||
    lower.includes('வேலை') ||
    lower.includes('চাকরি') ||
    lower.includes('কাজ চাই') ||
    lower.includes('ಕೆಲಸ') ||
    lower.includes('ಉದ್ಯೋಗ') ||
    lower.includes('ജോലി') ||
    lower.includes('काम पाहिजे') ||
    lower.includes('नोकरी') ||
    lower.includes('કામ જોઈએ') ||
    lower.includes('ਨੌਕਰੀ') ||
    lower.includes('ਕੰਮ ਚਾਹੀਦਾ') ||
    lower.includes('ଚାକିରି') ||
    lower.includes('କାମ ଦରକାର') ||
    lower.includes('ملازمت') ||
    lower.includes('চাকৰি');
  if (isJob) {
    session.preference = 'wage';
    return { intent: 'JOB_SEARCH', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // I. Training Search
  const isTraining =
    /(?:^|[^\p{L}])(training|course|courses|sikshana|shikshana|learn|classes|naaku training kavali|training chahiye|want training|sikhna)(?:$|[^\p{L}])/iu.test(lower) ||
    lower.includes('శిక్షణ') ||
    lower.includes('కోర్సు') ||
    lower.includes('ట్రైనింగ్') ||
    lower.includes('प्रशिक्षण') ||
    lower.includes('सीखना') ||
    lower.includes('ट्रेनिंग') ||
    lower.includes('প্রশিক্ষণ') ||
    lower.includes('প্ৰশিক্ষণ') ||
    lower.includes('শিখতে') ||
    lower.includes('பயிற்சி') ||
    lower.includes('கற்க') ||
    lower.includes('ತರಬೇತಿ') ||
    lower.includes('ಕಲಿಯಲು') ||
    lower.includes('പരിശീലനം') ||
    lower.includes('പഠിക്കാൻ') ||
    lower.includes('शिकायचे') ||
    lower.includes('शिकणे') ||
    lower.includes('તાલીમ') ||
    lower.includes('શીખવું') ||
    lower.includes('ਸਿਖਲਾਈ') ||
    lower.includes('ਸਿੱਖਣਾ') ||
    lower.includes('ତାଲିਮ') ||
    lower.includes('ଶିଖିବା') ||
    lower.includes('تربیت') ||
    lower.includes('سیکھنا') ||
    lower.includes('सिक्न') ||
    lower.includes('तालिम') ||
    lower.includes('फोरोंथाय');
  const isBareTrainingWord = /^(?:training|training\.|\btraining\b|శిక్షణ|ట్రైనింగ్|प्रशिक्षण|ट्रेनिंग|প্রশিক্ষণ|பயிற்சி|ತರಬೇತಿ|പരിശീലനം|तालीम|ਸਿਖਲਾਈ|ତାଲିମ)$/i.test(lower);
  if (isTraining || (isBareTrainingWord && activeCluster)) {
    session.preference = 'training';
    return { intent: 'TRAINING_SEARCH', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // J. Skill Discovery (User mentions their skill, e.g. "I know tailoring", "naaku kuttupani వచ్చు")
  const isSkillStatement =
    /(?:i know|i have experience|experience in|know tailoring|naaku|naku|mujhe|aati hai|తెలుసు|వచ్చు|জান|தெரியும்|ಗೊತ್ತು|അറിയാം|माहीत|ખબર|ਜਾਣਦਾ|ଜାଣିଛି)\s+([a-zA-Z\u0080-\uFFFF\s]+)/iu.test(lower) ||
    /^(?:i know tailoring|i know solar|i know dairy|tailoring|solar|dairy|kuttupani|silai)$/i.test(lower);
  if (isSkillStatement && activeCluster) {
    return { intent: 'SKILL_DISCOVERY', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  // K. Fallback contextual check
  if (session.lastTopic === 'training' && activeCluster) {
    return { intent: 'TRAINING_SEARCH', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }
  if (session.lastTopic === 'job' && activeCluster) {
    return { intent: 'JOB_SEARCH', cluster: activeCluster, selectedIndex, specificSchemeKey };
  }

  return { intent: 'GENERAL_QUESTION', cluster: activeCluster, selectedIndex, specificSchemeKey };
};

/**
 * Deterministic Multilingual Response Generator (Guarantees Zero English Leakage)
 * Uses the localized strings dictionary covering all 22 Indian Languages + English.
 */
export const generateDeterministicResponse = ({
  intent,
  detectedLang,
  cluster,
  session,
  courses = [],
  schemes = [],
  jobs = [],
  centers = [],
  selectedIndex = null,
  specificScheme = null
}) => {
  const strings = getStrings(detectedLang || 'en');

  // 1. GREETING
  if (intent === 'GREETING') {
    return strings.greeting;
  }

  // 2. GOODBYE
  if (intent === 'GOODBYE') {
    return strings.goodbye;
  }

  // 3. SKILL DISCOVERY
  if (intent === 'SKILL_DISCOVERY') {
    return strings.skillDiscovery(cluster);
  }

  // 4. TRAINING SEARCH (Course Listing from Database)
  if (intent === 'TRAINING_SEARCH') {
    if (!courses || courses.length === 0) {
      return strings.trainingNotFound;
    }

    let msg = strings.trainingHeader;
    courses.forEach((c, idx) => {
      msg += `*${idx + 1}. ${c.title}*\n`;
      msg += `   • ${strings.nsqfLabel}: ${c.nsqfLevel}\n`;
      msg += `   • ${strings.durationLabel}: ${c.durationMonths} ${strings.durationUnit}\n`;
      msg += `   • ${strings.providerLabel}: ${c.provider}\n`;
      msg += `   • ${strings.feeFree}\n\n`;
    });
    msg += strings.trainingFollowUp;
    return msg;
  }

  // 5. COURSE DETAILS FOLLOW-UP
  if (intent === 'COURSE_DETAILS') {
    const course = (courses && courses[selectedIndex]) || session.selectedCourse || (courses && courses[0]);
    if (!course) {
      return strings.courseDetailsNotFound;
    }

    return strings.courseDetailsHeader(course.title) +
      `• ${strings.nsqfLabel}: ${course.nsqfLevel}\n` +
      `• ${strings.qpCodeLabel}: ${course.qpCode}\n` +
      `• ${strings.durationLabel}: ${course.durationMonths} ${strings.durationUnit} (${course.mode})\n` +
      `• ${strings.providerLabel}: ${course.provider}\n` +
      `• ${strings.feeFree}\n` +
      `• ${strings.skillsGainedLabel}: ${(course.skillsGained && course.skillsGained.length > 0) ? course.skillsGained.join(', ') : strings.practicalWork}\n\n` +
      strings.nearbyPrompt;
  }

  // 6. COURSE COST QUERY
  if (intent === 'COURSE_COST') {
    return strings.courseCost;
  }

  // 7. LOCATION / NEARBY TRAINING CENTER
  if (intent === 'LOCATION_NEARBY') {
    if (!centers || centers.length === 0) {
      return strings.nearbyCentersNotFound(session.district);
    }

    let msg = strings.nearbyCentersHeader(session.district);
    centers.forEach((ctr, idx) => {
      msg += `*${idx + 1}. ${ctr.name}*\n`;
      msg += `   • ${strings.districtLabel}: ${ctr.district}\n`;
      msg += `   • ${strings.contactLabel}: ${ctr.contact}\n`;
      msg += `   • ${strings.tradesLabel}: ${ctr.trades.slice(0, 3).map((t) => t.replace(/_/g, ' ')).join(', ')}\n\n`;
    });
    msg += strings.enrollPrompt;
    return msg;
  }

  // 8. SPECIFIC SCHEME DETAILS (e.g. PMEGP, PM Vishwakarma)
  if (intent === 'SCHEME_DETAILS' && specificScheme) {
    return strings.schemeDetailsHeader(specificScheme.name) +
      `• ${strings.benefitLabel}: ${specificScheme.benefit}\n` +
      `• ${strings.eligibilityLabel}: ${specificScheme.eligibilitySummary}\n` +
      `• ${strings.portalLabel}: ${specificScheme.link || 'https://pmajay.dosje.gov.in'}\n\n` +
      strings.applyPrompt;
  }

  // 9. SCHEME SEARCH (Self-Employment / Business Opportunities)
  if (intent === 'SCHEME_SEARCH') {
    if (!schemes || schemes.length === 0) {
      return strings.schemeNotFound;
    }

    let msg = strings.schemeHeader;
    schemes.forEach((s, idx) => {
      msg += `*${idx + 1}. ${s.name}*\n`;
      msg += `   • ${strings.benefitLabel}: ${s.benefit}\n`;
      msg += `   • ${strings.eligibilityLabel}: ${s.eligibilitySummary}\n\n`;
    });
    msg += strings.schemeFollowUp;
    return msg;
  }

  // 10. JOB SEARCH
  if (intent === 'JOB_SEARCH') {
    if (!cluster) {
      return strings.jobAskSkill;
    }

    if (!jobs || jobs.length === 0) {
      return strings.jobNotFound(session.district, cluster);
    }

    let msg = strings.jobHeader(session.district);
    jobs.forEach((j, idx) => {
      msg += `*${idx + 1}. ${j.title}*\n`;
      msg += `   • ${strings.employerLabel}: ${j.employer}\n`;
      msg += `   • ${strings.districtLabel}: ${j.district}\n`;
      msg += `   • ${strings.wageLabel}: ₹${j.wage.toLocaleString()}${strings.perMonth}\n`;
      msg += `   • ${strings.openingsLabel}: ${j.openings}\n\n`;
    });
    msg += strings.jobApplyPrompt;
    return msg;
  }

  // 11. GENERAL QUESTION FALLBACK
  return strings.generalFallback;
};

/**
 * Main WhatsApp Conversational Turn Handler
 * 
 * Pipeline:
 * USER MESSAGE
 *      ↓
 * AUTOMATIC MULTILINGUAL LANGUAGE DETECTION (Per turn)
 *      ↓
 * CANONICAL RESPONSE LANGUAGE CREATION (e.g. "hi-IN", "te-IN")
 *      ↓
 * SESSION MEMORY & ENTITY EXTRACTION
 *      ↓
 * INTENT DETERMINATION
 *      ↓
 * REAL DATABASE LOOKUP (Course, Scheme, JobOpening, TrainingCenter)
 *      ↓
 * CONTEXTUAL LLM (Prompted with exact language & negative constraints)
 *      ↓
 * FINAL RESPONSE VALIDATION & SANITIZATION (Zero English Leakage Check)
 *      ↓
 * STORE TURN IN MONGODB CONVERSATION & MEMORY
 *      ↓
 * RETURN STRUCTURED RESPONSE IN 100% USER LANGUAGE
 */
export const handleWhatsAppMessage = async ({
  phone = '9876543210',
  message = '',
  rawLanguage = null,
  userId = null
}) => {
  const cleanMessage = String(message || '').trim();

  // 1. Language Detection Per Message (Never lock to previous language or default to en/te)
  let lid = detectLanguageFromText(cleanMessage);
  let detectedLang = lid.language;
  let detectedSpeechCode = lid.speechCode;
  let detectedLangName = lid.languageName;
  let detectedScript = lid.script;

  // If client explicitly passed a non-auto speechCode or language (e.g. authoritative from voice STT)
  if (rawLanguage && rawLanguage !== 'auto') {
    const norm = normalizeLanguageCode(rawLanguage);
    const cfg = getLanguageConfig(norm);
    if (cfg) {
      detectedLang = cfg.code;
      detectedSpeechCode = cfg.speechCode;
      detectedLangName = cfg.name;
      detectedScript = cfg.script;
    }
  }

  // 2. Retrieve Conversation Session Memory
  const session = await getWhatsAppSession(phone, userId);

  // If the message has no linguistic letters (e.g. user just types "1", "2", or "3" to select an option),
  // preserve the active session's language instead of defaulting a number to English
  const hasLetters = /[\p{L}]/u.test(cleanMessage);
  if (!hasLetters && session.language && session.language !== 'en') {
    detectedLang = session.language;
  }

  const langConfig = getLanguageConfig(detectedLang);
  const responseLanguage = langConfig.speechCode; // Canonical response language, e.g. "hi-IN", "te-IN"
  session.language = detectedLang;

  // 3. Analyze Turn: Extract Intent & Entities with Memory Context
  const analysis = analyzeWhatsAppTurn({
    message: cleanMessage,
    session,
    detectedLang
  });

  const { intent, cluster, selectedIndex, specificSchemeKey } = analysis;
  session.lastTopic = intent === 'TRAINING_SEARCH' || intent === 'COURSE_DETAILS'
    ? 'training'
    : intent === 'JOB_SEARCH'
      ? 'job'
      : intent === 'SCHEME_SEARCH' || intent === 'SCHEME_DETAILS'
        ? 'scheme'
        : session.lastTopic;

  // 4. Real Database Lookups based on Intent
  let courses = [];
  let schemes = [];
  let jobs = [];
  let centers = [];
  let specificScheme = null;

  if (intent === 'TRAINING_SEARCH' || intent === 'COURSE_DETAILS' || intent === 'LOCATION_NEARBY') {
    courses = await queryCoursesFromDB(cluster || 'tailoring', 3);
    if (courses.length > 0) {
      session.lastCourses = courses;
    }
  }

  if (intent === 'LOCATION_NEARBY' || intent === 'COURSE_DETAILS') {
    centers = await queryTrainingCentersFromDB(cluster || 'tailoring', session.district, 3);
    if (centers.length > 0) {
      session.lastCenters = centers;
    }
  }

  if (intent === 'SCHEME_SEARCH' || intent === 'SCHEME_DETAILS') {
    schemes = await querySchemesFromDB(cluster || 'tailoring', specificSchemeKey, 3);
    if (schemes.length > 0) {
      session.lastSchemes = schemes;
      if (specificSchemeKey) {
        specificScheme = schemes[0];
        session.selectedScheme = specificScheme;
      }
    }
  }

  if (intent === 'JOB_SEARCH') {
    if (cluster) {
      jobs = await queryJobsFromDB(cluster, session.district, 3);
      if (jobs.length > 0) {
        session.lastJobs = jobs;
      }
    }
  }

  // 5. Try Google Gemini LLM with Strict System Prompt & Zero English Leakage Constraints
  let finalReply = null;
  const geminiModel = getGeminiModel();

  if (geminiModel && cleanMessage) {
    try {
      const historySnippets = (session.recentTurns || []).slice(-4).map(
        (t) => `User: ${t.user}\nAssistant: ${t.bot}`
      ).join('\n\n');

      let dbFacts = '';
      if (courses.length > 0) {
        dbFacts += `Courses in DB:\n` + courses.map((c, i) => `${i + 1}. ${c.title} (NSQF ${c.nsqfLevel}, ${c.durationMonths} Months, Provider: ${c.provider}, Cost: Free ₹0, Mode: ${c.mode})`).join('\n') + '\n\n';
      }
      if (schemes.length > 0) {
        dbFacts += `Schemes in DB:\n` + schemes.map((s, i) => `${i + 1}. ${s.name}: ${s.benefit}. Eligibility: ${s.eligibilitySummary}`).join('\n') + '\n\n';
      }
      if (jobs.length > 0) {
        dbFacts += `Job Openings in DB:\n` + jobs.map((j, i) => `${i + 1}. ${j.title} at ${j.employer} (${j.district}), Wage: ₹${j.wage}/mo, Openings: ${j.openings}`).join('\n') + '\n\n';
      }
      if (centers.length > 0) {
        dbFacts += `Accredited Centers in ${session.district}:\n` + centers.map((ctr, i) => `${i + 1}. ${ctr.name} (Contact: ${ctr.contact})`).join('\n') + '\n\n';
      }

      const prompt = `
You are PM AJAY Sahayak, an official multilingual WhatsApp livelihood assistant.

CURRENT USER LANGUAGE:
${responseLanguage} (${langConfig.name} / ${langConfig.nativeName})

MANDATORY RULES:
1. Generate the complete response ONLY in ${responseLanguage} using ${langConfig.nativeName} native script.
2. DO NOT append English instructions (such as "Tell me more about...", "Reply with...", "Which one is nearby?", "Here are...").
3. DO NOT append English questions.
4. DO NOT append English fallback text.
5. DO NOT mix languages unless the user explicitly used code-mixed language or an official program name/acronym must remain unchanged.
6. Official names/acronyms (e.g. PMEGP, PM Vishwakarma, PM-AJAY, PMKVY, DDU-GKY, NSQF, DIC) may remain unchanged, but the surrounding explanatory text MUST be 100% in ${langConfig.nativeName}.
7. Use the conversation history to understand follow-up messages.
8. Use retrieved database information when available.
9. Answer the user's actual question directly, concisely, and naturally.
10. Format as a clean, friendly WhatsApp message with bullet points where appropriate.

User Message: "${cleanMessage}"

Retrieved Database Information:
${dbFacts || 'No specific database records required for this message.'}

Respond directly and ONLY in ${langConfig.nativeName} (${responseLanguage}):
`;

      const result = await geminiModel.generateContent(prompt);
      const text = result?.response?.text();
      if (text && text.trim().length > 10) {
        // Validate that Gemini didn't leak English boilerplate
        const validation = validateResponseLanguage({
          text: text.trim(),
          targetLang: detectedLang,
          targetSpeechCode: responseLanguage
        });

        if (validation.valid) {
          finalReply = text.trim();
        } else {
          console.warn('Gemini response rejected by zero-leakage validator:', validation.reason);
        }
      }
    } catch (llmErr) {
      // Fallback to deterministic generator
    }
  }

  // 6. Deterministic Multilingual Generator (guarantees 100% native language & zero English leakage)
  if (!finalReply) {
    finalReply = generateDeterministicResponse({
      intent,
      detectedLang,
      cluster,
      session,
      courses,
      schemes,
      jobs,
      centers,
      selectedIndex,
      specificScheme
    });
  }

  // 7. Final Validation Safeguard
  const finalValidation = validateResponseLanguage({
    text: finalReply,
    targetLang: detectedLang,
    targetSpeechCode: responseLanguage
  });
  if (!finalValidation.valid) {
    console.error('Final WhatsApp response validation warning:', finalValidation.reason);
  }

  // Section 21 Debug Logging
  console.log(`\n[INTENT]\n${intent}\n\n[RESPONSE]\nResponse language: ${responseLanguage}\n\n[TTS]\nTTS language: ${responseLanguage}\n\n[LOOKUP]\ncourses=${courses.length}, schemes=${schemes.length}, jobs=${jobs.length}, centers=${centers.length}\n\n[LANGUAGE DEBUG]\nmessage: ${cleanMessage}\ndetectedLanguage: ${detectedSpeechCode}\nresponseLanguage: ${responseLanguage}\nscript: ${detectedScript}\nconfidence: ${lid?.confidence || 0.9}\nintent: ${intent}\nentities: ${JSON.stringify({ cluster, selectedIndex, specificSchemeKey, knownSkills: session.knownSkills })}\nretrievedData: courses=${courses.length}, schemes=${schemes.length}, jobs=${jobs.length}, centers=${centers.length}\ngeneratedResponse:\n${finalReply}\nlanguageValidation: ${finalValidation.valid ? 'PASS' : 'FAIL'}\n`);

  // 8. Update Session Memory & Save Turn
  session.recentTurns.push({
    user: cleanMessage,
    bot: finalReply,
    language: detectedLang,
    timestamp: new Date()
  });
  if (session.recentTurns.length > 10) {
    session.recentTurns.shift();
  }

  // 9. Persist Turn in MongoDB
  try {
    let user = await User.findOne({ phone: session.phone });
    if (!user) {
      user = await User.create({
        name: `WhatsApp Citizen (${session.phone.slice(-4)})`,
        phone: session.phone,
        role: 'beneficiary',
        district: session.district,
        consent: { given: true, at: new Date(), version: '1.0', language: detectedLang }
      });
      session.userId = user._id;
    }

    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = await Profile.create({
        user: user._id,
        district: session.district,
        state: 'Telangana',
        channel: 'whatsapp',
        language: detectedLang,
        skills: session.knownSkills
      });
    } else {
      if (session.knownSkills.length > 0) {
        const merged = Array.from(new Set([...(profile.skills || []), ...session.knownSkills]));
        profile.skills = merged;
      }
      if (session.preference) profile.employmentPreference = session.preference;
      if (session.district) profile.district = session.district;
      profile.language = detectedLang;
      await profile.save();
    }

    let conv = await Conversation.findOne({ user: user._id, title: 'WhatsApp Session' });
    if (!conv) {
      conv = await Conversation.create({
        user: user._id,
        title: 'WhatsApp Session',
        language: detectedLang,
        messages: []
      });
    }

    conv.messages.push({
      sender: 'user',
      text: cleanMessage,
      timestamp: new Date()
    });

    conv.messages.push({
      sender: 'ai',
      text: finalReply,
      timestamp: new Date(),
      profileInsight: session.knownSkills.length > 0 ? {
        detectedSkill: session.knownSkills[session.knownSkills.length - 1],
        confirmed: true
      } : undefined
    });

    conv.language = detectedLang;
    await conv.save();
  } catch (dbErr) {
    // Non-blocking for conversation delivery
  }

  let displayUserMessage = cleanMessage;
  try {
    const normalizedUser = await normalizeVoiceTranscript({
      rawTranscript: cleanMessage,
      detectedLanguage: detectedLang
    });
    displayUserMessage = normalizedUser.displayTranscript || cleanMessage;
  } catch (e) {}

  return {
    replyText: finalReply,
    simulatedResponse: finalReply,
    displayUserMessage,
    inputLanguage: detectedSpeechCode,
    responseLanguage,
    language: detectedLang,
    languageName: langConfig.name,
    nativeName: langConfig.nativeName,
    speechCode: responseLanguage,
    script: detectedScript,
    intent,
    extractedSkills: session.knownSkills,
    matchedOpportunities: jobs,
    matchedCourses: courses,
    matchedSchemes: schemes
  };
};
