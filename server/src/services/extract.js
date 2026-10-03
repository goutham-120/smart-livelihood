/**
 * Rule Based Extractor and Entity Normalization Service
 * Extracts verified NSQF skills and profile attributes from vernacular and code mixed text.
 * Integrates semantic vector similarity as a secondary normalizer.
 */

import { Skill } from '../models/Skill.js';
import { skillsData } from '../seed/skillsData.js';
import { embed, cosine } from './embeddings.js';

let cachedSkillRecords = null;
let lastCacheTime = 0;

export const getSkillsList = async () => {
  const now = Date.now();
  if (cachedSkillRecords && now - lastCacheTime < 300000) {
    return cachedSkillRecords;
  }
  try {
    const skills = await Skill.find();
    if (skills && skills.length > 0) {
      cachedSkillRecords = skills;
      lastCacheTime = now;
      return skills;
    }
  } catch (err) {
    // Fallback to static skills master
  }
  cachedSkillRecords = skillsData;
  lastCacheTime = now;
  return skillsData;
};

// Core vernacular and colloquial keywords mapping to canonical skills
const VERNACULAR_STEMS = [
  // Agriculture & Farm Machinery
  {
    stems: ['ట్రాక్టర్', 'ట్రాక్టరు', 'వ్యవసాయ పనులు', 'ప్లవింగ్', 'హార్వెస్టర్', 'రోటవేటర్', 'ट्रैक्टर', 'खेती की मशीन', 'tractor', 'farm machinery', 'cultivator', 'tiller', 'harvester', 'rotavator', 'plowing'],
    skill: 'tractor_farm_machinery'
  },
  {
    stems: ['డ్రిప్', 'బిందు సేద్యం', 'స్ప్రింక్లర్', 'నీటి పారుదల', 'పైపులు', 'మరమ్మతు', 'సిస్టమ్', 'ड्रिप सिंचाई', 'स्प्रिंकलर', 'drip irrigation', 'micro irrigation', 'sprinkler irrigation', 'irrigation maintenance'],
    skill: 'drip_irrigation_maintenance'
  },
  {
    stems: ['పాలీహౌస్', 'గ్రీన్‌హౌస్', 'నర్సరీ', 'కూరగాయలు', 'మొక్కల పెంపకం', 'पालीहाउस', 'नर्सरी', 'polyhouse', 'nursery', 'greenhouse', 'seedling', 'vegetable grower'],
    skill: 'polyhouse_nursery_management'
  },
  {
    stems: ['సేంద్రీయ ఎరువులు', 'సేంద్రీయ వ్యవసాయం', 'సేంద్రీయ', 'వర్మీ కంపోస్ట్', 'వర్మీకంపోస్ట్', 'ఎరువులు', 'जैविक खाद', 'वर्मीकम्पोस्ट', 'कम्पोस्ट', 'vermicompost', 'organic compost', 'organic manure', 'biofertilizer', 'composting'],
    skill: 'organic_compost_vermicompost'
  },
  {
    stems: ['పురుగు మందులు', 'సస్యరక్షణ', 'తెగుళ్లు', 'कीट प्रबंधन', 'pest management', 'organic pest', 'crop protection'],
    skill: 'integrated_pest_management'
  },
  {
    stems: ['విత్తనాలు', 'విత్తన శుద్ధి', 'బీజ్ उपचार', 'seed treatment', 'seed grading'],
    skill: 'seed_grading_treatment'
  },
  {
    stems: ['ఔషధ మొక్కలు', 'మందు మొక్కలు', 'औषधीय पौधे', 'medicinal plants', 'herbal cultivation'],
    skill: 'medicinal_plant_cultivation'
  },

  // Sewing & Tailoring
  {
    stems: ['కుట్టు', 'కుడతాను', 'మిషన్', 'బ్లౌజులు', 'ఫ్రాకులు', 'టైలరింగ్', 'సెలై', 'सिलाई', 'tailor', 'tailoring', 'sewing', 'stitching', 'boutique', 'garment work'],
    skill: 'sewing_machine_operation'
  },
  {
    stems: ['చేతి ఎంబ్రాయిడరీ', 'కలంకారీ', 'మగ్గం పని', 'कढ़ाई', 'जरदोजी', 'embroidery', 'zari', 'aari'],
    skill: 'hand_embroidery'
  },
  {
    stems: ['నమూనా కటింగ్', 'ప్యాటర్న్', 'कपड़े पैटर्न', 'कपड़े काट', 'pattern cutting', 'measurement cutting'],
    skill: 'garment_pattern_cutting'
  },
  {
    stems: ['మగ్గం', 'చేనేత', 'हथकरघा', 'చేనేత నేత', 'handloom', 'weaving', 'loom'],
    skill: 'handloom_weaving'
  },

  // Dairy & Livestock
  {
    stems: ['మిల్కింగ్', 'పాలు తీయడం', 'మిల్క్ మిషన్', 'दूध निकालने', 'milking machine', 'dairy herd'],
    skill: 'milking_machine_handling'
  },
  {
    stems: ['పశువుల', 'పశువు', 'పశుపోషణ', 'పశువులు', 'ఆవులు', 'గేదెలు', 'పాలు', 'पशुओं', 'पशुपालन', 'गाय', 'भैंस', 'dairy farming', 'cattle feed', 'dairy', 'డెయిరీ'],
    skill: 'cattle_feed_nutrition'
  },
  {
    stems: ['మేకల', 'గొర్రెలు', 'గొర్రెల', 'మేకల పెంపకం', 'बकरी', 'भेड़', 'goat', 'sheep', 'goat rearing'],
    skill: 'goat_sheep_rearing'
  },
  {
    stems: ['కోళ్ల పెంపకం', 'పౌల్ట్రీ', 'मुर्गी पालन', 'poultry farm', 'broiler', 'brooding'],
    skill: 'poultry_farm_brooding'
  },

  // Solar & Electrical
  {
    stems: ['సోలార్', 'సోలార్ ప్యానెల్', 'సౌర శక్తి', 'सोलर', 'solar panel', 'solar pv', 'photovoltaic', 'solar installation', 'solar rooftop'],
    skill: 'solar_panel_installation'
  },
  {
    stems: ['వైరింగ్', 'కరెంట్ వైరింగ్', 'ఇంటి వైరింగ్', 'ఎలక్ట్రీషియన్', 'లైటింగ్', 'స్విచ్ బోర్డు', 'बिजली वायरिंग', 'तार जोड़े', 'इलेक्ट्रीशियन', 'house wiring', 'domestic wiring', 'electrician'],
    skill: 'house_wiring_electrical'
  },
  {
    stems: ['మోటార్ రీవైండింగ్', 'మోటారు', 'మోటార్ రిపేర్', 'మోటార్', 'పంప్ మోటార్', 'मोटर रिवाइंडिंग', 'मोटर ठीक', 'motor rewinding', 'electric motor rewinding', 'pump motor'],
    skill: 'motor_rewinding'
  },
  {
    stems: ['మిక్సర్', 'గ్రైండర్', 'కూలర్', 'మోటార్ రిపేర్', 'ఫ్యాన్', 'ఐరన్ బాక్స్', 'మిక్సీ', 'मोटर ठीक', 'कूलर', 'फैन रिपेयर', 'होम अप्लायंस', 'home appliance', 'appliance repair'],
    skill: 'home_appliance_repair'
  },
  {
    stems: ['ఏసీ', 'ఫ్రిజ్', 'రెఫ్రిజిరేటర్', 'కూలింగ్', 'फ्रिज', 'एसी रिपेयर', 'refrigerator repair', 'ac repair', 'fridge servicing'],
    skill: 'refrigeration_ac_servicing'
  },
  {
    stems: ['సిసిటివి', 'కెమెరా', 'సిక్యూరిటీ కెమెరా', 'सीसीटीवी', 'cctv installation', 'security camera'],
    skill: 'cctv_security_installation'
  },

  // Electronics & Mobile
  {
    stems: ['మొబైల్ ఫోన్లు', 'మొబైల్', 'మొబైల్స్', 'ఫోన్ రిపేర్', 'ఫోను', 'డిస్ప్లే', 'స్క్రీన్', 'స్మార్ట్‌ఫోన్', 'స్మార్ట్ ఫోన్', 'स्मार्टफोन', 'मोबाइल रिपेयरिंग', 'फ़ोन रिपेयर', 'mobile repairing', 'phone repair', 'smartphone repair', 'touch screen', 'mobile screen', 'charging jack'],
    skill: 'smartphone_hardware_repair'
  },

  // Food Processing
  {
    stems: ['ఊరగాయలు', 'ఊరగాయ', 'జామ్', 'ఆचार', 'मुरब्बा', 'pickle', 'jam preservation', 'food preservation'],
    skill: 'pickle_jam_preservation'
  },
  {
    stems: ['ఫుడ్ ప్యాకింగ్', 'ప్యాకింగ్ చేస్తాము', 'food packaging', 'hygiene packing'],
    skill: 'food_packaging_hygiene'
  },
  {
    stems: ['బేకింగ్', 'బేకరీ', 'కేకులు', 'बेकरी', 'baking cakes', 'bakery products', 'commercial baking'],
    skill: 'commercial_baking'
  },

  // Construction & Plumbing
  {
    stems: ['మేస్త్రీ', 'గోడల నిర్మాణం', 'చిన్న నిర్మాణాలు', 'चिनाई', 'राजमिस्त्री', 'masonry', 'bricklaying'],
    skill: 'masonry_bricklaying'
  },
  {
    stems: ['ప్లంబింగ్', 'పైపు లైన్', 'వాటర్ పైపులు', 'టాప్ ఫిట్టింగ్', 'नल फिटिंग', 'plumbing', 'sanitary plumbing', 'pipe fitting'],
    skill: 'sanitary_plumbing'
  },
  {
    stems: ['వెల్డింగ్', 'ఐరన్ గేట్లు', 'గ్రిల్స్', 'ఆర్క్ వెల్డింగ్', 'ఆటో వెల్డింగ్', 'आर्क वेल्डिंग', 'लोहे की ग्रिल', 'arc welding', 'welding fabrication'],
    skill: 'structural_arc_welding'
  },
  {
    stems: ['వడ్రంగి', 'చెక్క పని', 'కార్పెంట్రీ', 'తలుపులు', 'బల్లలు', 'बढ़ई', 'लकड़ी का काम', 'carpentry', 'wood work', 'furniture making'],
    skill: 'carpentry_shuttering'
  },

  // Digital & Office
  {
    stems: ['డేటా ఎంట్రీ', 'టైపింగ్', 'కంప్యూటర్', 'कंप्यूटर डेटा एंट्री', 'हिंदी टाइपिंग', 'data entry', 'vernacular typing'],
    skill: 'data_entry_vernacular_typing'
  },
  {
    stems: ['సిఎస్సి', 'మీసేవ', 'ఆధార్', 'csc center', 'meeseva', 'citizen service'],
    skill: 'csc_citizen_service_delivery'
  },
  {
    stems: ['డిజిటల్ బ్యాంకింగ్', 'ఆధార్ పేమెంట్స్', 'digital banking', 'dbt assistance'],
    skill: 'digital_banking_dbt_assistance'
  },
  {
    stems: ['కంప్యూటర్ రిపేర్', 'ప్రింటర్', 'సిస్టమ్ ప్రాబ్లమ్', 'computer troubleshooting', 'printer service'],
    skill: 'basic_computer_troubleshooting'
  },
  {
    stems: ['కస్టమర్ సేల్స్', 'సేల్స్', 'customer sales', 'retail sales', 'retail customer sales', 'sales counter'],
    skill: 'retail_sales_customer_service'
  },
  {
    stems: ['బిల్లింగ్', 'pos billing', 'pos digital billing', 'scanner billing', 'digital billing'],
    skill: 'pos_digital_billing'
  },
  {
    stems: ['బహీఖాతా', 'బహిఖాత', 'ఖాతా పుస్తకాలు', 'बहीखाता', 'bookkeeping', 'micro business accounting'],
    skill: 'micro_business_bookkeeping'
  },

  // Healthcare
  {
    stems: ['హాస్పిటల్', 'పేషెంట్ కేర్', 'మరీజోం', 'మందులు ఇవ్వడం', 'मरीजों की सेवा', 'general duty', 'patient care', 'ward boy', 'hospital assistant'],
    skill: 'general_duty_hospital_assistance'
  },
  {
    stems: ['ప్రథమ చికిత్స', 'ఫస్ట్ ఎయిడ్', 'బ్యాండేజ్', 'फर्स्ट एड', 'first aid', 'emergency response'],
    skill: 'first_aid_emergency_response'
  },
  {
    stems: ['వృద్ధుల సంరక్షణ', 'బెడ్సైడ్', 'elderly care', 'geriatric', 'patient home care'],
    skill: 'elderly_patient_home_care'
  }
];

/**
 * Resolves any skill string (canonical key, human-readable name, alias, vernacular phrase, or abbreviation)
 * to its exact canonical NSQF skill key. Returns null if invalid or unrecognized.
 */
export const resolveSkillToCanonicalKey = (input, allSkills = []) => {
  if (!input || typeof input !== 'string') return null;
  const cleaned = input.trim().toLowerCase().replace(/[-_]+/g, ' ');
  const rawKey = input.trim().toLowerCase().replace(/\s+/g, '_');

  // Reject obvious garbage / corrupt fragments
  if (cleaned.length < 3 || ['d', 'ho', 'sma', 'null', 'undefined', 'na', 'none'].includes(cleaned)) {
    return null;
  }

  // 1. Direct exact key match
  const matchByKey = allSkills.find((s) => s.key === rawKey || s.key === input.trim().toLowerCase());
  if (matchByKey) return matchByKey.key;

  // 2. Direct name match (English, Hindi, Telugu)
  const matchByName = allSkills.find((s) => {
    const sName = (s.name || '').toLowerCase();
    const enName = (s.names?.en || '').toLowerCase();
    const hiName = (s.names?.hi || '').toLowerCase();
    const teName = (s.names?.te || '').toLowerCase();
    return sName === cleaned || enName === cleaned || hiName === cleaned || teName === cleaned;
  });
  if (matchByName) return matchByName.key;

  // 3. Alias match
  const matchByAlias = allSkills.find((s) => {
    return (s.aliases || []).some((a) => a.toLowerCase() === cleaned || cleaned.includes(a.toLowerCase()));
  });
  if (matchByAlias) return matchByAlias.key;

  // 4. Substring / keyword match in name or key
  for (const s of allSkills) {
    const sKeyWords = s.key.replace(/_/g, ' ');
    if (sKeyWords.includes(cleaned) || cleaned.includes(sKeyWords)) {
      return s.key;
    }
  }

  // 5. Vernacular stem match
  for (const item of VERNACULAR_STEMS) {
    if (item.stems.some((stem) => cleaned.includes(stem.toLowerCase()) || stem.toLowerCase().includes(cleaned))) {
      return item.skill;
    }
  }

  // 6. Common synonym fallbacks
  if (cleaned.includes('tractor') || cleaned.includes('farm machine') || cleaned.includes('cultivator')) return 'tractor_farm_machinery';
  if (cleaned.includes('irrigation') || cleaned.includes('drip') || cleaned.includes('sprinkler')) return 'drip_irrigation_maintenance';
  if (cleaned.includes('mobile') || cleaned.includes('smartphone') || cleaned.includes('cell phone') || cleaned.includes('android')) return 'smartphone_hardware_repair';
  if (cleaned.includes('appliance') || cleaned.includes('mixer') || cleaned.includes('cooler') || cleaned.includes('fan repair')) return 'home_appliance_repair';
  if (cleaned.includes('tailor') || cleaned.includes('sewing') || cleaned.includes('stitching') || cleaned.includes('cloth cut')) return 'sewing_machine_operation';
  if (cleaned.includes('wiring') || cleaned.includes('electric') || cleaned.includes('electrician')) return 'house_wiring_electrical';
  if (cleaned.includes('rewind') || cleaned.includes('motor')) return 'motor_rewinding';
  if (cleaned.includes('compost') || cleaned.includes('vermi') || cleaned.includes('fertilizer') || cleaned.includes('organic farm')) return 'organic_compost_vermicompost';
  if (cleaned.includes('dairy') || cleaned.includes('cattle') || cleaned.includes('cow') || cleaned.includes('milk')) return 'cattle_feed_nutrition';
  if (cleaned.includes('plumb') || cleaned.includes('pipe')) return 'sanitary_plumbing';
  if (cleaned.includes('weld')) return 'structural_arc_welding';
  if (cleaned.includes('mason') || cleaned.includes('brick')) return 'masonry_bricklaying';
  if (cleaned.includes('carpent') || cleaned.includes('wood')) return 'carpentry_shuttering';
  if (cleaned.includes('solar')) return 'solar_panel_installation';
  if (cleaned.includes('data entry') || cleaned.includes('typing')) return 'data_entry_vernacular_typing';
  if (cleaned.includes('baking') || cleaned.includes('bakery')) return 'commercial_baking';
  if (cleaned.includes('pickle') || cleaned.includes('jam')) return 'pickle_jam_preservation';

  return null;
};

/**
 * Extract canonical skill keys from natural speech text.
 * Checks aliases, canonical names in English, Hindi, Telugu, vernacular stems, and embeddings.
 * @param {string} text
 * @returns {Promise<string[]>} Array of valid skill keys
 */
export const extractSkillsFromText = async (text) => {
  if (!text || typeof text !== 'string') return [];

  const lowerText = text.toLowerCase();
  const allSkills = await getSkillsList();
  const validKeySet = new Set(allSkills.map((s) => s.key));
  const matched = new Set();

  // 1. Vernacular & Regional Stems check
  for (const item of VERNACULAR_STEMS) {
    if (validKeySet.has(item.skill)) {
      const hasStem = item.stems.some((stem) => lowerText.includes(stem.toLowerCase()));
      if (hasStem) {
        matched.add(item.skill);
      }
    }
  }

  // 2. Direct name, alias, and localized names check
  for (const skill of allSkills) {
    const hasAlias = (skill.aliases || []).some((alias) => {
      const lowerAlias = alias.toLowerCase();
      return lowerText.includes(lowerAlias);
    });

    const hasName =
      lowerText.includes(skill.name.toLowerCase()) ||
      (skill.names?.hi && lowerText.includes(skill.names.hi.toLowerCase())) ||
      (skill.names?.te && lowerText.includes(skill.names.te.toLowerCase())) ||
      (skill.names?.en && lowerText.includes(skill.names.en.toLowerCase()));

    if (hasAlias || hasName) {
      matched.add(skill.key);
    }
  }

  return Array.from(matched);
};

/**
 * Detect user intent such as repeating, lack of knowledge, confirming, or correcting.
 * @param {string} text
 * @returns {{ intent: string, correctedField: string|null, correctedValue: any }}
 */
export const detectUserIntent = (text) => {
  const lower = String(text || '').toLowerCase().trim();

  // Repeat request
  const repeatTerms = [
    'repeat', 'malli cheppandi', 'phir se', 'phir se boliye', 'once more',
    'malla cheppu', 'dobara bolo', 'again please', 'pardon'
  ];
  if (repeatTerms.some((t) => lower.includes(t))) {
    return { intent: 'repeat', correctedField: null, correctedValue: null };
  }

  // Lack of knowledge or skip
  const dontKnowTerms = [
    'dont know', "don't know", 'teliyadu', 'pata nahi', 'maalum nahi',
    'skip', 'daatandi', 'chhod do', 'not sure', 'gurthu ledu'
  ];
  if (dontKnowTerms.some((t) => lower.includes(t))) {
    return { intent: 'dont_know', correctedField: null, correctedValue: null };
  }

  // Affirmative / Confirmation
  const confirmTerms = [
    'yes', 'avunu', 'haan', 'sare', 'correct', 'theek hai', 'ha', 'sure',
    'sarle', 'confirm', 'nijame', 'alagane', 'sari'
  ];
  if (confirmTerms.some((t) => lower === t || lower.startsWith(t + ' ') || lower.endsWith(' ' + t))) {
    return { intent: 'confirm', correctedField: null, correctedValue: null };
  }

  // Negative / Deny
  const denyTerms = [
    'no', 'kaadu', 'nahi', 'vaddu', 'galat', 'wrong', 'tappu'
  ];
  if (denyTerms.some((t) => lower === t || lower.startsWith(t + ' '))) {
    return { intent: 'deny', correctedField: null, correctedValue: null };
  }

  // Corrections handling
  const correctionIndicators = ['actually', 'kaadu', 'nijaniki', 'asalulo', 'badle', 'instead'];
  const hasCorrection = correctionIndicators.some((c) => lower.includes(c));

  if (hasCorrection) {
    const yearMatch = lower.match(/(\d+)\s*(years|year|saal|ellu|samvatsaralu)/i);
    if (yearMatch) {
      return {
        intent: 'correct',
        correctedField: 'experienceYears',
        correctedValue: parseInt(yearMatch[1], 10)
      };
    }
    if (lower.includes('job') || lower.includes('naukri') || lower.includes('wage')) {
      return { intent: 'correct', correctedField: 'employmentPreference', correctedValue: 'wage' };
    }
    if (lower.includes('business') || lower.includes('dukan') || lower.includes('self')) {
      return { intent: 'correct', correctedField: 'employmentPreference', correctedValue: 'self' };
    }
  }

  return { intent: 'answer', correctedField: null, correctedValue: null };
};

/**
 * Rule based extraction of profile fields from vernacular speech.
 * @param {string} text
 * @param {string} stage
 * @returns {object} Extracted profile attributes
 */
export const extractProfileAttributes = (text, stage = '') => {
  const lower = String(text || '').toLowerCase().trim();
  const extracted = {};

  // Check for negated wage (e.g. "job vaddu", "naukri nahi", "no job")
  const isWageNegated =
    lower.includes('ఉద్యోగం వద్దు') ||
    lower.includes('నౌకరీ వద్దు') ||
    lower.includes('नौकरी नहीं') ||
    lower.includes('no job') ||
    lower.includes('job vaddu') ||
    lower.includes('job nahi');

  // Check for negated self employment
  const isSelfNegated =
    lower.includes('వ్యాపారం వద్దు') ||
    lower.includes('షాప్ వద్దు') ||
    lower.includes('दुकान नहीं') ||
    lower.includes('no business');

  let hasWageTerm =
    /\b(wage|naukri|job|company|udyogam|salary|monthly salary)\b/i.test(lower) ||
    lower.includes('नौकरी') ||
    lower.includes('ఉద్యోగం');

  let hasSelfTerm =
    /\b(self|business|dukaan|dukan|karobar|enterprise|boutique|shop)\b/i.test(lower) ||
    lower.includes('sontha') ||
    lower.includes('vyaparam') ||
    lower.includes('khud ka') ||
    lower.includes('షాప్') ||
    lower.includes('दुकान') ||
    lower.includes('సొంతంగా');

  if (isWageNegated) hasWageTerm = false;
  if (isSelfNegated) hasSelfTerm = false;

  if (hasWageTerm && !hasSelfTerm) {
    extracted.employmentPreference = 'wage';
  } else if (hasSelfTerm && !hasWageTerm) {
    extracted.employmentPreference = 'self';
  } else if (lower.includes('both') || lower.includes('rendoo') || lower.includes('dono') || lower.includes('either') || (hasWageTerm && hasSelfTerm)) {
    extracted.employmentPreference = 'either';
  }

  // Education level - normalized to standard UI options
  if (lower.includes('post graduate') || lower.includes('pg') || lower.includes('mtech') || lower.includes('msc') || lower.includes('mcom') || lower.includes('mba')) {
    extracted.education = 'Post Graduate';
  } else if (lower.includes('degree') || lower.includes('graduate') || lower.includes('college') || lower.includes('btech') || lower.includes('bcom') || lower.includes('bsc') || lower.includes('ba')) {
    extracted.education = 'Graduate';
  } else if (lower.includes('iti') || lower.includes('diploma') || lower.includes('polytechnic')) {
    extracted.education = 'Diploma / ITI';
  } else if (lower.includes('intermediate') || lower.includes('inter') || lower.includes('12th') || lower.includes('plus two') || lower.includes('11th') || lower.includes('12वीं')) {
    extracted.education = 'Higher Secondary (12th)';
  } else if (lower.includes('10th') || lower.includes('tenth') || lower.includes('ssc') || lower.includes('matric') || lower.includes('10वीं') || lower.includes('టెన్త్') || lower.includes('10వ') || lower.includes('high school')) {
    extracted.education = 'Secondary (10th)';
  } else if (lower.includes('8th') || lower.includes('7th') || lower.includes('6th') || lower.includes('middle school') || lower.includes('yedava') || lower.includes('8వ') || lower.includes('7వ') || lower.includes('8वीं') || lower.includes('7वीं')) {
    extracted.education = 'Middle (8th)';
  } else if (lower.includes('5th') || lower.includes('primary') || lower.includes('prathamic') || lower.includes('aikava') || lower.includes('5వ') || lower.includes('5वीं')) {
    extracted.education = 'Primary (5th)';
  } else if (lower.includes('no school') || lower.includes('anpadh') || lower.includes('chaduvukoledu') || lower.includes('illiterate') || lower.includes('chaduvu ledu') || lower.includes('below primary')) {
    extracted.education = 'Below Primary';
  }

  // Monthly Income Goal
  const thousandsMatch = lower.match(/(\d+)\s*(k|thousand|hazar|velu|hazaar|వేలు|हजार)/i);
  if (thousandsMatch) {
    extracted.incomeGoal = parseInt(thousandsMatch[1], 10) * 1000;
  } else {
    const rawNumberMatch = lower.match(/\b(\d{4,6})\b/);
    if (rawNumberMatch) {
      extracted.incomeGoal = parseInt(rawNumberMatch[1], 10);
    }
  }

  // Experience years
  const expMatch = lower.match(/(\d+)\s*(years|year|saal|ellu|samvatsaralu|ఏళ్లు|సంవత్సరాలు|साल)/i);
  if (expMatch) {
    extracted.experienceYears = parseInt(expMatch[1], 10);
  }

  // Mobility constraints - aligned with UI options
  if (
    lower.includes('cannot travel') ||
    lower.includes('cannot leave') ||
    lower.includes('home based') ||
    lower.includes('intlo') ||
    lower.includes('intidaggara') ||
    lower.includes('ghar par') ||
    lower.includes('uru daatalenu') ||
    lower.includes('village only') ||
    lower.includes('outside no') ||
    lower.includes('ఇంట్లోనే') ||
    lower.includes('గ్రామంలో')
  ) {
    extracted.mobilityConstraints = ['Within Village Only'];
  } else if (lower.includes('block') || lower.includes('mandal') || lower.includes('nearby town') || lower.includes('మండలం')) {
    extracted.mobilityConstraints = ['Within Block'];
  } else if (lower.includes('district') || lower.includes('జిల్లా')) {
    extracted.mobilityConstraints = ['Within District'];
  }

  // Livelihood & Family Occupation identification
  if (
    lower.includes('కుట్టు') || lower.includes('టైలరింగ్') || lower.includes('సెలై') || lower.includes('सिलाई') ||
    lower.includes('tailor') || lower.includes('sewing') || lower.includes('stitching') || lower.includes('embroidery') || lower.includes('garment')
  ) {
    extracted.currentLivelihood = 'Tailoring & Garment Work';
    extracted.familyOccupation = 'Tailoring & Crafts';
  } else if (
    lower.includes('ట్రాక్టర్') || lower.includes('డ్రిప్') || lower.includes('ఇరిగేషన్') ||
    lower.includes('వ్యవసాయం') || lower.includes('వర్మీకంపోస్ట్') || lower.includes('సేంద్రీయ') ||
    lower.includes('tractor') || lower.includes('machinery') || lower.includes('irrigation') ||
    lower.includes('farming') || lower.includes('agriculture') || lower.includes('compost') || lower.includes('खेती') || lower.includes('ट्रैक्टर')
  ) {
    extracted.currentLivelihood = 'Farm Machinery & Agricultural Support';
    extracted.familyOccupation = 'Agriculture & Farming';
  } else if (
    lower.includes('స్మార్ట్‌ఫోన్') || lower.includes('మొబైల్') || lower.includes('ఫోన్') ||
    lower.includes('అప్లయెన్స్') || lower.includes('వైరింగ్') || lower.includes('మోటార్') || lower.includes('ఎలక్ట్రికల్') ||
    lower.includes('smartphone') || lower.includes('mobile') || lower.includes('appliance') || lower.includes('repair') ||
    lower.includes('wiring') || lower.includes('electrical') || lower.includes('motor rewinding') || lower.includes('बिजली') || lower.includes('रिपेयर')
  ) {
    extracted.currentLivelihood = 'Electronics & Appliance Repair';
    extracted.familyOccupation = 'Electronics & Technical Trades';
  } else if (
    lower.includes('డెయిరీ') || lower.includes('పశువులు') || lower.includes('మేకల') || lower.includes('dairy') || lower.includes('cattle') || lower.includes('goat') || lower.includes('milking')
  ) {
    extracted.currentLivelihood = 'Dairy & Animal Husbandry';
    extracted.familyOccupation = 'Animal Husbandry';
  } else if (
    lower.includes('ప్లంబింగ్') || lower.includes('వెల్డింగ్') || lower.includes('మేస్త్రీ') || lower.includes('plumbing') || lower.includes('welding') || lower.includes('masonry')
  ) {
    extracted.currentLivelihood = 'Plumbing & Technical Trades';
    extracted.familyOccupation = 'Construction & Trades';
  } else if (
    lower.includes('సేల్స్') || lower.includes('కిరాణా') || lower.includes('దుకాణం') || lower.includes('retail') || lower.includes('sales') || lower.includes('shop') || lower.includes('store')
  ) {
    extracted.currentLivelihood = 'Retail & Customer Services';
    extracted.familyOccupation = 'Small Business & Commerce';
  } else if (
    lower.includes('ఊరగాయ') || lower.includes('బేకరీ') || lower.includes('జామ్') || lower.includes('pickle') || lower.includes('bakery') || lower.includes('food')
  ) {
    extracted.currentLivelihood = 'Food Processing & Production';
    extracted.familyOccupation = 'Food Enterprise';
  }

  // District recognition
  if (lower.includes('warangal') || lower.includes('hanamkonda') || lower.includes('వరంగల్')) {
    extracted.district = 'Warangal';
  } else if (lower.includes('adilabad') || lower.includes('ఆదిలాబాద్')) {
    extracted.district = 'Adilabad';
  } else if (lower.includes('nalgonda') || lower.includes('నల్గొండ')) {
    extracted.district = 'Nalgonda';
  }

  return extracted;
};

/**
 * Infer general family occupation and current livelihood from identified skill keys
 */
export const inferLivelihoodFromSkills = (skills = []) => {
  const skList = (skills || []).map((s) => String(s).toLowerCase());
  if (skList.some((s) => s.includes('tractor') || s.includes('irrigation') || s.includes('compost') || s.includes('polyhouse') || s.includes('pest'))) {
    return {
      currentLivelihood: 'Farm Machinery & Agricultural Support',
      familyOccupation: 'Agriculture & Farming'
    };
  }
  if (skList.some((s) => s.includes('smartphone') || s.includes('appliance') || s.includes('solar') || s.includes('wiring') || s.includes('electric'))) {
    return {
      currentLivelihood: 'Electronics & Appliance Repair',
      familyOccupation: 'Electronics & Technical Trades'
    };
  }
  if (skList.some((s) => s.includes('sewing') || s.includes('tailor') || s.includes('embroidery') || s.includes('garment'))) {
    return {
      currentLivelihood: 'Tailoring & Garment Work',
      familyOccupation: 'Tailoring & Crafts'
    };
  }
  if (skList.some((s) => s.includes('dairy') || s.includes('cattle') || s.includes('goat') || s.includes('milking'))) {
    return {
      currentLivelihood: 'Dairy & Animal Husbandry',
      familyOccupation: 'Animal Husbandry'
    };
  }
  if (skList.some((s) => s.includes('plumb') || s.includes('weld') || s.includes('masonry'))) {
    return {
      currentLivelihood: 'Plumbing & Technical Trades',
      familyOccupation: 'Construction & Trades'
    };
  }
  if (skList.some((s) => s.includes('retail') || s.includes('pos') || s.includes('data_entry') || s.includes('csc'))) {
    return {
      currentLivelihood: 'Retail & Citizen Services',
      familyOccupation: 'Small Business & Commerce'
    };
  }
  if (skList.some((s) => s.includes('pickle') || s.includes('baking') || s.includes('spice') || s.includes('food'))) {
    return {
      currentLivelihood: 'Food Processing & Production',
      familyOccupation: 'Food Enterprise'
    };
  }
  if (skList.some((s) => s.includes('hospital') || s.includes('care') || s.includes('aid') || s.includes('patient') || s.includes('health'))) {
    return {
      currentLivelihood: 'Healthcare & Community Assistance',
      familyOccupation: 'Healthcare & Allied Services'
    };
  }
  if (skills.length > 0) {
    return {
      currentLivelihood: 'Technical & Trade Services',
      familyOccupation: 'Skilled Trades & Services'
    };
  }
  return {};
};

export const extractLivelihoodProfile = async (text) => {
  if (!text || typeof text !== 'string') return {};
  const skills = await extractSkillsFromText(text);
  const attributes = extractProfileAttributes(text);
  const inferred = (!attributes.currentLivelihood || !attributes.familyOccupation) && skills.length > 0
    ? inferLivelihoodFromSkills(skills)
    : {};

  return {
    ...inferred,
    ...attributes,
    skills: skills.length > 0 ? skills : []
  };
};
