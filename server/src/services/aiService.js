import { GoogleGenerativeAI } from '@google/generative-ai';
import { SarvamAIClient } from 'sarvamai';
import { Skill } from '../models/Skill.js';
import { skillsData } from '../seed/skillsData.js';
import { resolveSkillToCanonicalKey } from './extract.js';

let geminiClient = null;
let sarvamClient = null;
let cachedSkillKeys = null;

const getValidSkillKeys = async () => {
  if (cachedSkillKeys) return cachedSkillKeys;
  try {
    const allSkills = await Skill.find().select('key').maxTimeMS(2000);
    if (allSkills && allSkills.length > 0) {
      cachedSkillKeys = new Set(allSkills.map((s) => s.key));
      return cachedSkillKeys;
    }
  } catch (err) {
    // Non fatal, fallback to static skillsData
  }
  cachedSkillKeys = new Set((skillsData || []).map((s) => s.key));
  return cachedSkillKeys;
};

const getGeminiModel = () => {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

const getSarvamClient = () => {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) return null;
  if (!sarvamClient) {
    sarvamClient = new SarvamAIClient({ apiKey });
  }
  return sarvamClient;
};

// Safe JSON extractor that cleans markdown wrappers
const parseJsonSafely = (text) => {
  try {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
};

export const generateEmpatheticResponse = async ({
  userMessage,
  language = 'en',
  userContext = {},
  conversationHistory = [],
  relevantDatabaseResults = []
}) => {
  const validSkillKeys = await getValidSkillKeys();

  const { getLanguageConfig, STAGE_PROMPTS, normalizeIndicUtterance, detectLanguageFromText, normalizeLanguageCode } = await import('../channels/languages.js');
  let effectiveLang = normalizeLanguageCode(language);
  if (effectiveLang === 'en' && userMessage) {
    const textLid = detectLanguageFromText(userMessage);
    if (textLid && textLid.language !== 'en') {
      effectiveLang = textLid.language;
    }
  }
  const langConfig = getLanguageConfig(effectiveLang);
  const utteranceAnalysis = normalizeIndicUtterance(userMessage, langConfig.code);

  const formattedHistory = Array.isArray(conversationHistory) && conversationHistory.length > 0
    ? conversationHistory.slice(-8).map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
    : (userContext.historyContext || 'None (first turn)');

  const formattedDbResults = Array.isArray(relevantDatabaseResults) && relevantDatabaseResults.length > 0
    ? relevantDatabaseResults.join('\n')
    : 'None';

  const prompt = `
You are an empathetic, encouraging livelihood voice counselor for rural and low-literacy citizens under India's PM-AJAY welfare initiative.

USER_LANGUAGE: ${langConfig.name}
LANGUAGE_CODE: ${langConfig.speechCode}
USER_MESSAGE: "${userMessage}"

CONVERSATION_HISTORY:
${formattedHistory}

RELEVANT_DATABASE_RESULTS:
${formattedDbResults}

Current Beneficiary Profile Context:
- Name: ${userContext.name || 'Friend'}
- District: ${userContext.district || 'Warangal, Telangana'}
- Existing Skills: ${(userContext.skills || []).join(', ') || 'None recorded yet'}
- Employment Preference: ${userContext.employmentPreference || 'Open'}
- Education Level: ${userContext.education || 'Not specified'}

RECENT CONVERSATION HISTORY:
${userContext.historyContext || formattedHistory || 'None (New Conversation)'}

CURRENT USER MESSAGE: "${userMessage}"
${utteranceAnalysis.englishMeaning ? `Semantic Meaning / Interpretation: "${utteranceAnalysis.englishMeaning}"` : ''}

CRITICAL RULES:
1. You MUST respond entirely in USER_LANGUAGE (${langConfig.name}) in its native script (${langConfig.nativeName}).
2. Do not switch to English unless USER_LANGUAGE is English.
3. Do not translate the answer into English or append English instructions, questions, or follow-up sentences.
4. Keep official organization names, course names, scheme names, URLs, technical names, and proper nouns unchanged when appropriate.
5. Understand the user's message semantically IN CONTEXT OF THE RECENT CONVERSATION HISTORY above.
6. Resolve short follow-up responses, pronouns, affirmations, and short queries ("yes", "no", "okay", "tell me more", "explain", "how?", "where?", "continue") using the RECENT CONVERSATION HISTORY.
7. Maintain topic continuity. Continue ongoing conversation topic smoothly without changing subject unless explicitly introduced.
8. DO NOT restart with a generic initial greeting or welcome introduction during an ongoing conversation (where RECENT CONVERSATION HISTORY is present).
9. Respond directly to the user's ACTUAL question or intent.
10. NEVER ask for or mention caste or sensitive personal attributes.
11. Extract valid skills only if explicitly mentioned by user from this canonical list:
[${Array.from(validSkillKeys).join(', ')}]

You MUST return your output strictly in this JSON format with no additional text:
{
  "replyText": "Warm spoken reply text entirely in ${langConfig.name} native script answering the user's ACTUAL question in context with NO English leakage",
  "extractedSkills": ["skill_key_1"],
  "identifiedPreference": "self" | "wage" | "either" | null,
  "familyOccupation": "e.g. Agriculture / Weaving / Carpentry / Business / Daily wage or null",
  "currentLivelihood": "e.g. Farm machinery repair / Tailoring / Electrical work / Daily labour or null",
  "education": "Secondary (10th)" | "Higher Secondary (12th)" | "Middle (8th)" | "Primary (5th)" | "Diploma / ITI" | "Graduate" | "Below Primary" | null,
  "experienceYears": 3,
  "incomeGoal": 18000,
  "mobilityConstraints": ["Within Village Only" | "Within Block" | "Within District"] | null,
  "followUpQuestion": null
}
`;

  try {
    // Attempt Gemini first
    const model = getGeminiModel();
    if (model) {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = parseJsonSafely(text);
      if (parsed && parsed.replyText) {
        const allSkills = Array.from(validSkillKeys).map((k) => ({ key: k, title: k }));
        const filteredSkills = Array.from(new Set(
          (parsed.extractedSkills || [])
            .map((sk) => resolveSkillToCanonicalKey(sk, allSkills) || (validSkillKeys.has(sk.toLowerCase()) ? sk.toLowerCase() : null))
            .filter(Boolean)
        ));
        return {
          replyText: parsed.replyText,
          extractedSkills: filteredSkills,
          identifiedPreference: ['self', 'wage', 'either'].includes(parsed.identifiedPreference) ? parsed.identifiedPreference : null,
          familyOccupation: parsed.familyOccupation || null,
          currentLivelihood: parsed.currentLivelihood || null,
          education: parsed.education || null,
          experienceYears: typeof parsed.experienceYears === 'number' ? parsed.experienceYears : null,
          incomeGoal: typeof parsed.incomeGoal === 'number' ? parsed.incomeGoal : null,
          mobilityConstraints: Array.isArray(parsed.mobilityConstraints) ? parsed.mobilityConstraints : null,
          followUpQuestion: null
        };
      }
    }
  } catch (geminiError) {
    // Fallback to Sarvam if Gemini fails or is unavailable
  }

  try {
    const sarvam = getSarvamClient();
    if (sarvam) {
      const completion = await sarvam.chat.completions({
        model: 'sarvam-105b-conversations',
        messages: [
          {
            role: 'system',
            content: `You are an empathetic Indian livelihood skilling counselor. Resolve follow-up responses using conversation history. Output strictly valid JSON with replyText in ${langConfig.name}, extractedSkills, familyOccupation, currentLivelihood, education, experienceYears, incomeGoal.`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const text = completion.choices?.[0]?.message?.content || '';
      const parsed = parseJsonSafely(text);
      if (parsed && parsed.replyText) {
        const allSkills = Array.from(validSkillKeys).map((k) => ({ key: k, title: k }));
        const filteredSkills = Array.from(new Set(
          (parsed.extractedSkills || [])
            .map((sk) => resolveSkillToCanonicalKey(sk, allSkills) || (validSkillKeys.has(sk.toLowerCase()) ? sk.toLowerCase() : null))
            .filter(Boolean)
        ));
        return {
          replyText: parsed.replyText,
          extractedSkills: filteredSkills,
          identifiedPreference: ['self', 'wage', 'either'].includes(parsed.identifiedPreference) ? parsed.identifiedPreference : null,
          familyOccupation: parsed.familyOccupation || null,
          currentLivelihood: parsed.currentLivelihood || null,
          education: parsed.education || null,
          experienceYears: typeof parsed.experienceYears === 'number' ? parsed.experienceYears : null,
          incomeGoal: typeof parsed.incomeGoal === 'number' ? parsed.incomeGoal : null,
          mobilityConstraints: Array.isArray(parsed.mobilityConstraints) ? parsed.mobilityConstraints : null,
          followUpQuestion: null
        };
      }
    }
  } catch (sarvamError) {
    // Fallback rule-based response
  }

  // 23-Language Native Script Fallback Matrix (Zero English Leakage)
  const NATIVE_FALLBACKS = {
    greeting_how_are_you: {
      te: 'నేను బాగున్నాను! మీకు ఈరోజు నేను ఎలా సహాయపడగలను?',
      hi: 'मैं बिल्कुल ठीक हूँ! आज मैं आपकी क्या सहायता कर सकता हूँ?',
      en: 'I am doing well! How can I help you today?',
      ta: 'நான் நலமாக இருக்கிறேன்! இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?',
      kn: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
      mr: 'मी मजेत आहे! आज मी तुम्हाला कशी मदत करू शकतो?',
      bn: 'আমি ভালো আছি! আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
      gu: 'હું મજામાં છું! આજે હું તમને કેવી રીતે મદદ કરી શકું?',
      pa: 'ਮੈਂ ਬਿਲਕੁਲ ਠੀਕ ਹਾਂ! ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
      or: 'ମୁଁ ଭଲ ଅଛି! ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
      od: 'ମୁଁ ଭଲ ଅଛି! ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
      ml: 'എനിക്ക് സുഖമാണ്! ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?',
      ur: 'میں بالکل ٹھیک ہوں! آج میں آپ کی کیا مدد کر سکتا ہوں؟',
      as: 'মই ভালে আছোঁ! আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?',
      ne: 'म सन्चै छु! आज म तपाईंलाई कसरी मद्दत गर्न सक्छु?',
      sa: 'अहं कुशली अस्मि! अद्य अहं भवतः कथं साहाय्यं कर्तुं शक्नोमि?',
      mai: 'हम बिल्कुल ठीक छी! आई हम अहाँक की सहायता कऽ सकैत छी?',
      kok: 'हांव बरो आसां! आयज हांव तुमकां कशी मदत करूं येता?',
      ks: 'बऺ छुस ठीक! अज़ कथि पऺठि हऺकिथ म्याऺनि तरफ़ऺ मदद?',
      sd: 'مان بلڪل ٺيڪ آهيان! اڄ مان توهان جي ڪهڙي مدد ڪري سگهان ٿو؟',
      sat: 'ᱤᱧ ᱫᱚ ᱵᱮᱥ ᱜᱮ ᱢᱮᱱᱟᱹᱧᱟ! ᱛᱮᱦᱮᱧ ᱤᱧ ᱟᱢᱟᱜ ᱪᱮᱫ ᱜᱚᱲᱚᱧ ᱮᱢ ᱫᱟᱲᱮᱭᱟᱢᱟ?',
      mni: 'ঐহাক অফবা লৈরি! ঙসি ঐহাক্না অদোমদা করম্না মতেং পাংবা ঙমগনি?',
      brx: 'आं मोजांङैनो दं! दिनै आं नोंखौ माबायदि हेफाजाब होनो हागौ?',
      doi: 'मैं बिल्कुल ठीक आं! अज्ज मैं तुंदी केह् मदद करी सकदा आं?'
    },
    request_training: {
      te: 'తప్పకుండా! మీకు టైలరింగ్, సోలార్ టెక్నీషియన్, డెయిరీ ఫార్మింగ్ వంటి ఉచిత నైపుణ్య శిక్షణలు అందుబాటులో ఉన్నాయి. మీరు ఏ రంగంలో శిక్షణ పొందాలనుకుంటున్నారు?',
      hi: 'ज़रूर! हमारे पास सिलाई, सोलर इंस्टॉलेशन और डेयरी जैसे कई मुफ्त प्रशिक्षण कार्यक्रम उपलब्ध हैं। आप किस काम में ट्रेनिंग लेना चाहते हैं?',
      en: 'Certainly! Free training is available in tailoring, solar technician, dairy farming, and other sectors. Which skill would you like to learn?',
      ta: 'நிச்சயமாக! தையல், சோலார் மற்றும் பால் பண்ணை போன்ற இலவச பயிற்சிகள் உள்ளன. நீங்கள் எந்த துறையில் பயிற்சி பெற விரும்புகிறீர்கள்?',
      kn: 'ಖಂಡಿತ! ಟೈಲರಿಂಗ್, ಸೋಲಾರ್ ಮತ್ತು ಡೈರಿ ಫಾರ್ಮಿಂಗ್ ಮುಂತಾದ ಉಚಿತ ಕೌಶಲ್ಯ ತರಬೇತಿಗಳು ಲಭ್ಯವಿವೆ. ನೀವು ಯಾವ ಕ್ಷೇತ್ರದಲ್ಲಿ ತರಬೇತಿ ಪಡೆಯಲು ಬಯಸುತ್ತೀರಿ?',
      mr: 'नक्कीच! टेलरिंग, सोलर तंत्रज्ञ आणि दुग्धव्यवसाय यासारखी मोफत कौशल्य प्रशिक्षणे उपलब्ध आहेत. तुम्हाला कोणत्या क्षेत्रात प्रशिक्षण घ्यायचे आहे?',
      bn: 'অবশ্যই! আমাদের কাছে সেলাই, সোলার টেকনিশিয়ান এবং ডেইরি ফার্মিংয়ের মতো বিনামূল্যে প্রশিক্ষণ রয়েছে। আপনি কোন ক্ষেত্রে প্রশিক্ষণ নিতে চান?',
      gu: 'ચોક્કસ! સિલાઈ, સોલાર ટેકનિશિયન અને ડેરી ફાર્મિંગ જેવી મફત તાલીમો ઉપલબ્ધ છે. તમે કયા ક્ષેત્રમાં તાલીમ મેળવવા માંગો છો?',
      pa: 'ਜ਼ਰੂਰ! ਟੇਲਰਿੰਗ, ਸੋਲਰ ਟੈਕਨੀਸ਼ੀਅਨ ਅਤੇ ਡੇਅਰੀ ਵਰਗੀਆਂ ਮੁਫ਼ਤ ਸਿਖਲਾਈਆਂ ਉਪਲਬਧ ਹਨ। ਤੁਸੀਂ ਕਿਸ ਖੇਤਰ ਵਿੱਚ ਸਿਖਲਾਈ ਲੈਣਾ ਚਾਹੁੰਦੇ ਹੋ?',
      or: 'ନିଶ୍ଚିତ ଭାବରେ! ଟେଲରିଂ, ସୌର ଟେକ୍ନିସିଆନ୍ ଏବଂ ଡାଏରୀ ଫାର୍ମିଂ ଭଳି ମାଗଣା ପ୍ରଶିକ୍ଷଣ ଉପଲବ୍ଧ। ଆପଣ କେଉଁ କ୍ଷେତ୍ରରେ ପ୍ରଶିକ୍ଷଣ ନେବାକୁ ଚାହାଁନ୍ତି?',
      od: 'ନିଶ୍ଚିତ ଭାବରେ! ଟେଲରିଂ, ସୌର ଟେକ୍ନିସିଆନ୍ ଏବଂ ଡାଏରୀ ଫାର୍ମିଂ ଭଳି ମାଗଣା ପ୍ରଶିକ୍ଷଣ ଉପଲବ୍ଧ। ଆପଣ କେଉଁ କ୍ଷେତ୍ରରେ ପ୍ରଶିକ୍ଷଣ ନେବାକୁ ଚାହାଁନ୍ତି?',
      ml: 'തീർച്ചയായും! തയ്യൽ, സോളാർ, ഡയറി ഫാമിംഗ് തുടങ്ങിയ സൗജന്യ പരിശീലനങ്ങൾ ലഭ്യമാണ്. നിങ്ങൾക്ക് ഏത് മേഖലയിലാണ് പരിശീലനം വേണ്ടത്?',
      ur: 'ضرور! سلائی، سولر ٹیکنیشن اور ڈیری فارمنگ جیسی مفت تربیت دستیاب ہے۔ آپ کس شعبے میں تربیت حاصل کرنا چاہتے ہیں؟',
      as: 'নিশ্চয়! দৰ্জীৰ কাম, সৌৰ প্ৰযুক্তি আৰু দুগ্ধ ফাৰ্মিংৰ দৰে বিনামূলীয়া প্ৰশিক্ষণ উপলব্ধ। আপুনি কোনটো ক্ষেত্ৰত শিকিব বিচাৰে?',
      ne: 'अवश्य! सिलाई-कटाई, सौर्य प्राविधिक र डेरी जस्ता नि:शुल्क तालिमहरू उपलब्ध छन्। तपाईं कुन क्षेत्रमा तालिम लिन चाहनुहुन्छ?',
      sa: 'अवश्यम्! सूचीकर्म, सौर-यन्त्रज्ञानं तथा दुग्धव्यवसाय-प्रशिक्षणम् उपलभ्यते। भवान् कस्मिन् क्षेत्रे प्रशिक्षणम् इच्छति?',
      mai: 'निश्चय! सिलाई, सोलर आ डेयरी फार्मिंग सन मुफ्त प्रशिक्षण उपलब्ध अछि। अहाँ कोन क्षेत्र मे प्रशिक्षण लेबऽ चाहैत छी?',
      kok: 'निश्चयान! टेलरिंग, सोलर टेक्निशियन आनी डेरी फार्मिंग सारक्यो फुकट प्रशिक्षणां उपलब्ध आसात। तुमकां खंयच्या मळार शिकूंक जाय?',
      ks: 'ज़रूर! सीयून-कटून, सोलर टेक्निशियन तॖ डेरी फार्मिंग मुफ़्त ट्रेनिंग छि दस्तयाब। तुहि कमिस कामस मंज़ ट्रेनिंग छि बाछान?',
      sd: 'ضرور! سلائي، سولر ۽ ڊيري فارمنگ جي مفت تربيت موجود آهي. توهان ڪهڙي ڪم ۾ تربيت حاصل ڪرڻ چاهيو ٿا؟',
      sat: 'ᱦᱚᱭ ᱛᱚ! ᱞᱩᱜᱽᱲᱤ ᱛᱮᱧ, ᱥᱚᱞᱟᱨ ᱟᱨ ᱜᱟᱹᱭ ᱟᱹᱥᱩᱞ ᱞᱮᱠᱟᱱ ᱵᱤᱱᱟᱹ ᱯᱩᱭᱥᱟᱹ ᱛᱮ ᱥᱮᱪᱮᱫ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱟᱢ ᱚᱠᱟ ᱠᱟᱹᱢᱤ ᱪᱮᱫᱚᱜ ᱥᱟᱱᱟᱭᱮᱫ ᱢᱮᱭᱟ?',
      mni: 'হোই! সেলাই তৌবা, সোলার তেক্নিসিয়ান অমসুং দাইরি ফার্মিংগুম্বা লেম্না ত্রেনিং পীবা য়াই। অদোম করম্বা ত্রেনিং লৌনিংই?',
      brx: 'निश्चय! टेलरिं, सलार टेक्निशियान आरो दुरुं फालिनाय बादि मुफत फोरोंथाय दं। नोंथाङा बबे बिथिंआव फोरोंथाय लानो लुबैयो?',
      doi: 'ज़रूर! सिलाई, सोलर तकनीशियन ते डेरी फार्मिंग जेह्ड़े मुफ़्त प्रशिक्षण उपलब्ध न। तुस किश कम्म च ट्रेनिंग लैना चांह्दे ओ?'
    },
    request_job: {
      te: 'తప్పకుండా! మీ అర్హతలు మరియు నైపుణ్యాల ఆధారంగా ఉపాధి అవకాశాలు ఉన్నాయి. మీ విద్యార్హత మరియు మీరు ఏ రకమైన ఉద్యోగం కోసం చూస్తున్నారో చెప్పండి.',
      hi: 'ज़रूर! आपके हुनर और अनुभव के आधार पर कई रोजगार के अवसर हैं। कृपया अपनी योग्यता और पसंदीदा काम बताएं।',
      en: 'Certainly! We have livelihood and job opportunities based on your skills. Please share your education and the type of work you are looking for.',
      ta: 'நிச்சயமாக! உங்கள் தகுதிக்கு ஏற்ப வேலைவாய்ப்புகள் உள்ளன. உங்கள் கல்வித்தகுதி மற்றும் நீங்கள் விரும்பும் வேலை பற்றி கூறுங்கள்.',
      kn: 'ಖಂಡಿತ! ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳಿಗೆ ತಕ್ಕ ಉದ್ಯೋಗಾವಕಾಶಗಳಿವೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿದ್ಯಾರ್ಹತೆ ಮತ್ತು ನೀವು ಬಯಸುವ ಕೆಲಸದ ಬಗ್ಗೆ ತಿಳಿಸಿ.',
      mr: 'नक्कीच! तुमच्या पात्रतेनुसार आणि कौशल्यानुसार रोजगाराच्या चांगल्या संधी आहेत. कृपया तुमचे शिक्षण व पसंतीचे काम सांगा.',
      bn: 'অবশ্যই! আপনার योग्यता ও দক্ষতার ভিত্তিতে কর্মসংস্থানের সুযোগ রয়েছে। অনুগ্রহ করে আপনার শিক্ষাগত যোগ্যতা ও পছন্দের কাজ জানান।',
      gu: 'ચોક્કસ! આપની યોગ્યતા અને કુશળતા અનુસાર રોજગારીની તકો છે. કૃપા કરીને તમારો અભ્યાસ અને પસંદગીનું કામ જણાવો.',
      pa: "ਜ਼ਰੂਰ! ਤੁਹਾਡੀ ਯੋਗਤਾ ਅਤੇ ਹੁਨਰ ਦੇ ਆਧਾਰ 'ਤੇ ਰੋਜ਼ਗਾਰ ਦੇ ਮੌਕੇ ਉਪਲਬਧ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਪੜ੍ਹਾਈ ਅਤੇ ਪਸੰਦੀਦਾ ਕੰਮ ਦੱਸੋ।",
      or: 'ନିଶ୍ଚିତ ଭାବରେ! ଆପଣଙ୍କ ଯୋଗ୍ୟତା ଏବଂ ଦକ୍ଷତା ଅନୁଯାୟୀ ରୋଜଗାରର ସୁଯୋଗ ରହିଛି। ଦୟାକରି ଆପଣଙ୍କ ଶିକ୍ଷା ଏବଂ ପସନ୍ଦର କାମ କୁହନ୍ତୁ।',
      od: 'ନିଶ୍ଚିତ ଭାବରେ! ଆପଣଙ୍କ ଯୋଗ୍ୟତା ଏବଂ ଦକ୍ଷତା ଅନୁଯାୟୀ ରୋଜଗାରର ସୁଯୋଗ ରହିଛି। ଦୟାକରି ଆପଣଙ୍କ ଶିକ୍ଷା ଏବଂ ପସନ୍ଦର କାମ କୁହନ୍ତୁ।',
      ml: 'തീർച്ചയായും! നിങ്ങളുടെ യോഗ്യതയ്ക്ക് അനുയോജ്യമായ തൊഴിലവസരങ്ങൾ ലഭ്യമാണ്. നിങ്ങളുടെ വിദ്യാഭ്യാസവും താല്പര്യമുള്ള ജോലിയും വ്യക്തമാക്കുക.',
      ur: 'ضرور! آپ کی قابلیت اور مہارت کی بنیاد پر روزگار کے مواقع دستیاب ہیں۔ براہ کرم اپنی تعلیم اور پسندیدہ کام بتائیں۔',
      as: 'নিশ্চয়! আপোনাৰ যোগ্যতা আৰু দক্ষতা অনুসৰি কৰ্মসংস্থাপনৰ সুযোগ আছে। অনুগ্ৰহ কৰি আপোনাৰ শিক্ষা আৰু পছন্দৰ কাম জনাওক।',
      ne: 'अवश्य! तपाईंको सीप र योग्यता अनुसार रोजगारीका अवसरहरू छन्। कृपया आफ्नो पढाइ र मनपर्ने काम बताउनुहोस्।',
      sa: 'अवश्यम्! भवतः कौशल्यस्य आधारेण उद्योग-अवसराः सन्ति। कृपया स्व-विद्याम् अभिरुचितं कार्यं च वदतु।',
      mai: 'निश्चय! अहाँक योग्यता आ हुनरक आधार पर रोजगारक अवसर उपलब्ध अछि। अपन पढ़ाई आ पसंदक काज बताओ।',
      kok: 'निश्चयान! तुमच्या हुशारकाये प्रमाण रोजगाराच्यो संदी उपलब्ध आसात। उपकार करून तुमचें शिकप आनी आवडीचें काम सांगात।',
      ks: 'ज़रूर! तुहन्दिस हुनरस तॖ काबलियतस मुतालिक छि रोज़गारुक मवका। मेहरबानी कऺरिथ वऺनिव पनिन तालीम तॖ काम।',
      sd: 'ضرور! توهان جي لياقت ۽ قابليت مطابق روزگار جا موقعا موجود آهن. مهرباني ڪري پنهنجي تعليم ۽ پسند جو ڪم ٻڌايو.',
      sat: 'ᱦᱚᱭ ᱛᱚ! ᱟᱢᱟᱜ ᱠᱟᱹᱢᱤ ᱟᱨ ᱦᱩᱱᱟᱹᱨ ᱞᱮᱠᱟᱛᱮ ᱪᱟᱹᱠᱨᱤ ᱨᱮᱭﺎᱜ ᱫᱟᱣ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱟᱢᱟᱜ ᱚᱞᱚᱜ ᱯᱟᱲᱦᱟᱣ ᱟᱨ ᱠᱩᱥᱤᱭᱟᱜ ᱠᱟᱹᱢᱤ ᱞᱟᱹᱭ ᱢᱮ᱾',
      mni: 'হোই! অদোমগী হৈ-শিংবগী মতুং ইন্না থবক ফংবগী খুদোংচাবা লৈরি। চানবীদুনা অদোমগী মহৈ-মশিং অমসুং পাম্বা থবক শন্দোক্না হায়বীয়ু।',
      brx: 'निश्चय! नोंथांनि रोंमोन्थाय आरो हुनरनि बादियै खामानि मोन्नायनि खाबु दं। अननानै नोंथांनि फरायनाय आरो मोजां मोननाय खामानिनि सोमोन्दै खोनथा।',
      doi: 'ज़रूर! तुंदी योग्यता ते हुनर दे आधार पर रोजगार दे मौके उपलब्ध न। कृपा करियै अपनी पढ़ाई ते पसंदीदा कम्म दस्सो।'
    },
    greeting: {
      te: 'నమస్కారం! PM-AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. ఈరోజు మీకు నేను ఎలా సహాయపడగలను?',
      hi: 'नमस्ते! PM-AJAY आजीविका सहायक में आपका स्वागत है। आज मैं आपकी क्या मदद कर सकता हूँ?',
      en: 'Hello! Welcome to the PM-AJAY Livelihood Assistant. How can I help you today?',
      ta: 'வணக்கம்! PM-AJAY வாழ்வாதார உதவியாளருக்கு வரவேற்கிறோம். இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?',
      kn: 'ನಮಸ್ಕಾರ! PM-AJAY ಜೀವನಾಧಾರ ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
      mr: 'नमस्कार! PM-AJAY उपजीविका सहाय्यकामध्ये आपले स्वागत आहे. आज मी आपली काय मदत करू शकतो?',
      bn: 'নমস্কার! PM-AJAY জীবিকা সহায়ক পোর্টালে স্বাগতম। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
      gu: 'નમસ્તે! PM-AJAY આજીવિકા સહાયકમાં આપનું સ્વાગત છે. આજે હું તમને કેવી રીતે મદદ કરી શકું?',
      pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! PM-AJAY ਰੋਜ਼ਗਾਰ ਸਹਾਇਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
      or: 'ନମସ୍କାର! PM-AJAY ଜୀବିକା ସହାୟକକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
      od: 'ନମସ୍କାର! PM-AJAY ଜୀବିକା ସହାୟକକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
      ml: 'നമസ്കാരം! PM-AJAY ജീവനോപാധി അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?',
      ur: 'آداب! PM-AJAY روزگار اسسٹنٹ میں آپ کا خیر مقدم ہے۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟',
      as: 'নমস্কাৰ! PM-AJAY জীৱিকা সহায়কলৈ স্বাগতম। আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?',
      ne: 'नमस्ते! PM-AJAY जीविकोपार्जन सहायकमा स्वागत छ। आज म तपाईंलाई कसरी सहयोग गर्न सक्छु?',
      sa: 'नमो नमः! PM-AJAY आजीविका-सहायके स्वागतम्। अद्य अहं किं साहाय्यं करवाणि?',
      mai: 'प्रणाम! PM-AJAY आजीविका सहायक मे अहाँक स्वागत अछि। आई हम अहाँक की सहायता करू?',
      kok: 'नमस्कार! PM-AJAY उपजीविका सहायकांत तुमकां येवकार। आयज हांव तुमकां कशी मदत करूं?',
      ks: 'आदाब! PM-AJAY रोज़गार मददगारस मंज़ स्वागत। अज़ कथि पऺठि हऺकिथ मदद?',
      sd: 'سلام! PM-AJAY روزگار اسسٽنٽ ۾ ڀلي ڪري آيا. اڄ مان توهان جي ڇا مدد ڪري سگهان ٿو؟',
      sat: 'ᱡᱚᱦᱟᱨ! PM-AJAY ᱟᱥᱨᱟ ᱜᱚᱲᱚᱭᱤᱡ ᱴᱷᱮᱱ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ᱾ ᱛᱮᱦᱮᱧ ᱪᱮᱫ ᱜᱚᱲᱚᱧ ᱮᱢ ᱫᱟᱲᱮᱭᱟᱢᱟ?',
      mni: 'খুরুমজরি! PM-AJAY পুন্সি মহিং মতেং পাংবদা তরাম্না ওকচরি। ঙসি ঐহাক্না করম্না মতেং পাংবা ঙমগনি?',
      brx: 'खुलुमबाय! PM-AJAY जिउ-राहा हेफाजाबग्रायाव बरायबाय। दिनै आं मा हेफाजाब होनो हागौ?',
      doi: 'नमस्ते! PM-AJAY आजीविका सहायक च तुंदा स्वागत ऐ। अज्ज मैं तुंदी केह् मदद करी सकदा आं?'
    },
    general: {
      te: 'మీరు చెప్పిన వివరాలను నమోదు చేసుకున్నాను. మీ నైపుణ్యాలకు తగిన ఉచిత శిక్షణ మరియు ప్రభుత్వ పథకాల సమాచారాన్ని అందించడానికి నేను సిద్ధంగా ఉన్నాను.',
      hi: 'मैंने आपकी बात समझ ली है। आपके कौशल के अनुसार सही ट्रेनिंग और योजनाओं की जानकारी देने के लिए मैं उपलब्ध हूँ।',
      en: 'I have understood your message. I am here to help you discover verified training programs and livelihood schemes.',
      ta: 'உங்கள் விவரங்களை நான் புரிந்து கொண்டேன். உங்களுக்கு ஏற்ற பயிற்சி மற்றும் அரசு திட்டங்கள் பற்றிய தகவல்களை வழங்க நான் தயாராக உள்ளேன்.',
      kn: 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ. ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳಿಗೆ ಸೂಕ್ತವಾದ ಉಚಿತ ತರಬೇತಿ ಮತ್ತು ಸರಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿಯನ್ನು ನೀಡಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ.',
      mr: 'मी आपली माहिती नोंदवून घेतली आहे. आपल्या कौशल्यांनुसार योग्य मोफत प्रशिक्षण व सरकारी योजनांची माहिती देण्यासाठी मी तयार आहे.',
      bn: 'আমি আপনার বিবরণ নোট করেছি। আপনার দক্ষতার জন্য সঠিক বিনামূল্যে প্রশিক্ষণ এবং সরকারি প্রকল্পগুলি সম্পর্কে তথ্য দিতে আমি প্রস্তুত।',
      gu: 'મેં તમારી માહિતી નોંધી લીધી છે. તમારી આવડત મુજબ મફત તાલીમ અને સરકારી યોજનાઓની માહિતી આપવા હું તૈયાર છું.',
      pa: 'ਮੈਂ ਤੁਹਾਡੀ ਗੱਲ ਸਮਝ ਲਈ ਹੈ। ਤੁਹਾਡੇ ਹੁਨਰ ਮੁਤਾਬਕ ਮੁਫ਼ਤ ਸਿਖਲਾਈ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਜਾਣਕਾਰੀ ਦੇਣ ਲਈ ਮੈਂ ਤਿਆਰ ਹਾਂ।',
      or: 'ମୁଁ ଆପଣଙ୍କ କଥା ବୁଝିପାରିଲି। ଆପଣଙ୍କ ଦକ୍ଷତା ଅନୁଯାୟୀ ମାଗଣା ପ୍ରଶିକ୍ଷଣ ଏବଂ ସରକାରୀ ଯୋଜନା ବିଷୟରେ ସୂଚନା ଦେବାକୁ ମୁଁ ପ୍ରସ୍ତୁତ।',
      od: 'ମୁଁ ଆପଣଙ୍କ କଥା ବୁଝିପାରିଲି। ଆପଣଙ୍କ ଦକ୍ଷତା ଅନୁଯାୟୀ ମାଗଣା ପ୍ରଶିକ୍ଷଣ ଏବଂ ସରକାରୀ ଯୋଜନା ବିଷୟରେ ସୂଚନା ଦେବାକୁ ମୁଁ ପ୍ରସ୍ତୁତ।',
      ml: 'നിങ്ങളുടെ വിവരങ്ങൾ ഞാൻ മനസ്സിലാക്കി. നിങ്ങളുടെ കഴിവിന് അനുയോജ്യമായ സൗജന്യ പരിശീലനങ്ങളും സർക്കാർ പദ്ധതികളും കണ്ടെത്താൻ ഞാൻ സഹായിക്കാം.',
      ur: 'میں نے آپ کی بات سمجھ لی ہے۔ آپ کی مہارت کے مطابق مفت تربیت اور سرکاری اسکیموں کی معلومات دینے کے لیے میں تیار ہوں۔',
      as: 'মই আপোনাৰ কথা বুজি পালোঁ। আপোনাৰ দক্ষতা অনুসৰি বিনামূলীয়া প্ৰশিক্ষণ আৰু চৰকাৰী আঁচনিৰ তথ্য দিবলৈ মই সাজু।',
      ne: 'मैले तपाईंको कुरा बुझें। तपाईंको सीप अनुसार नि:शुल्क तालिम र सरकारी योजनाहरूको जानकारी दिन म तयार छु।',
      sa: 'अहं भवतः वचनम् अवगच्छामि। भवतः कौशल्यानुसारं निःशुल्क-प्रशिक्षणस्य योजनानां च सूचनां दातुं तत्परोऽस्मि।',
      mai: 'हम अहाँक बात बुझि गेलहुँ। अहाँक हुनरक अनुसार मुफ्त ट्रेनिंग आ सरकारी योजनाक जानकारी देबाक लेल हम तैयार छी।',
      kok: 'हांवें तुमची म्हायती समजून घेतली। तुमच्या कौशल्या प्रमाण फुकट प्रशिक्षण आनी सरकारी येवजण्यांची म्हायती दिवंक हांव तयार आसां।',
      ks: 'म्याऺन्य तरफ़ऺ गव तुहुन्द मुदॖ समझ। तुहंदिस हुनरस मुतालिक ट्रेनिंग तॖ स्कीम जानकारी दिनस छुस तयार।',
      sd: 'مان توهان جي ڳالهه سمجهي ورتي آهي. توهان جي صلاحيت مطابق مفت تربيت ۽ سرڪاري اسڪيمن جي ڄاڻ ڏيڻ لاءِ تيار آهيان.',
      sat: 'ᱤᱧ ᱟᱢᱟᱜ ᱠᱟᱛᱷᱟᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫ-ᱟ᱾ ᱟᱢᱟᱜ ᱦᱩᱱᱟᱹᱨ ᱞᱮᱠᱟᱛᱮ ᱵᱤᱱᱟᱹ ᱯᱩᱭᱥᱟᱹ ᱥᱮᱪᱮᱫ ᱟᱨ ᱥᱚᱨᱠᱟᱨᱤ ᱡᱚᱡᱚᱱᱟ ᱵᱟᱵᱚᱛ ᱞᱟᱹᱭ ᱞᱟᱹᱜᱤᱫ ᱤᱧ ᱛᱮᱭᱟᱨ ᱢᱮᱱᱟᱹᱧᱟ᱾',
      mni: 'ঐহাক্না অদোমগী ৱাফম খঙলে। অদোমগী হৈ-শিংবদা য়ুমফম ওইরগা লেম্না ত্রেনিং অমসুং সরকারগী স্কিমগী ৱাফম ফোঙদোকপদা য়াওবা ঙমগনি।',
      brx: 'आं नोंथांनि बाथ्राखौ बुजिबाय। नोंथांनि हुनरनि बादियै मुफत फोरोंथाय आरो सरकारि बिथांखिनि रादाब होनो आं थियारि।',
      doi: 'मैं तुंदी गल्ल समझी लई ऐ। तुंदे हुनर दे मुताबिक मुफ़्त ट्रेनिंग ते सरकारी योजनाएं दी जानकारी देने लेई मैं तयार आं।'
    }
  };

  const hasHistory = Boolean(userContext.historyContext && userContext.historyContext.trim().length > 0);
  const isShortFollowUp = /^(yes|no|okay|ok|haan|ha|avunu|sare|sure|tell me more|explain|how|why|where|when|continue|more)$/i.test((userMessage || '').trim());

  let fallbackReply = '';
  // Contextual fallback during an ongoing conversation (DO NOT return initial welcome greeting if history exists!)
  if (hasHistory && (isShortFollowUp || utteranceAnalysis.intent === 'greeting' || utteranceAnalysis.intent === 'greeting_how_are_you')) {
    switch (langConfig.code) {
      case 'te':
        fallbackReply = 'తప్పకుండా! మన సంభాషణ ఆధారంగా మీ ప్రశ్నను స్వీకరించాను. ఈ అంశంపై మీకు ఎలాంటి మరిన్ని వివరాలు కావాలి?';
        break;
      case 'hi':
        fallbackReply = 'बिल्कुल! हमारी बातचीत के संदर्भ में मैंने आपकी बात समझ ली है। कृपया बताएं कि आपको आगे क्या जानकारी चाहिए।';
        break;
      case 'ta':
        fallbackReply = 'நிச்சயமாக! நமது உரையாடலின் தொடர்ச்சியாக உங்கள் பதிலைப் புரிந்து கொண்டேன்.';
        break;
      case 'kn':
        fallbackReply = 'ಖಂಡಿತ! ನಮ್ಮ సంభాషణೆಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ವಿಷಯವನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ.';
        break;
      default:
        fallbackReply = 'Certainly! Continuing our conversation, I understand your response. Please let me know what specific guidance or next steps you would like to explore.';
        break;
    }
  } else {
    const intentKey = ['greeting_how_are_you', 'request_training', 'request_job', 'greeting'].includes(utteranceAnalysis.intent)
      ? utteranceAnalysis.intent
      : 'general';

    const categoryMap = NATIVE_FALLBACKS[intentKey] || NATIVE_FALLBACKS.general;
    fallbackReply = categoryMap[langConfig.code] || categoryMap.hi || categoryMap.en;
  }
  return {
    replyText: fallbackReply,
    extractedSkills: [],
    identifiedPreference: null,
    familyOccupation: null,
    currentLivelihood: null,
    education: null,
    experienceYears: null,
    incomeGoal: null,
    mobilityConstraints: null,
    followUpQuestion: null
  };
};

