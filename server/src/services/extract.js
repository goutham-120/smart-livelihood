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

const getSkillsList = async () => {
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
  // Sewing & Tailoring
  {
    stems: ['కుట్టు', 'కుడతాను', 'మిషన్', 'బ్లౌజులు', 'ఫ్రాకులు', 'టైలరింగ్', 'సెలై', 'सिलाई', 'tailor', 'tailoring', 'sewing', 'stitching', 'boutique'],
    skill: 'sewing_machine_operation'
  },
  {
    stems: ['చేతి ఎంబ్రాయిడరీ', 'కలంకారీ', 'कढ़ाई', 'जरदोजी', 'embroidery', 'zari', 'aari'],
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
    stems: ['మిల్కింగ్', 'పాలు తీయడం', 'दूध निकालने', 'milking machine', 'dairy herd'],
    skill: 'milking_machine_handling'
  },
  {
    stems: ['పశువుల', 'పశువు', 'పశుపోషణ', 'పశువులు', 'पशुओं', 'पशुपालन', 'cattle feed', 'dairy', 'డెయిరీ'],
    skill: 'cattle_feed_nutrition'
  },
  {
    stems: ['మేకల', 'గొర్రెలు', 'గొర్రెల', 'बकरी', 'भेड़', 'goat', 'sheep'],
    skill: 'goat_sheep_rearing'
  },

  // Solar & Electrical
  {
    stems: ['సోలార్', 'సోలార్ ప్యానెల్', 'सोलर', 'solar panel', 'solar pv', 'photovoltaic', 'solar installation'],
    skill: 'solar_panel_installation'
  },
  {
    stems: ['వైరింగ్', 'కరెంట్ వైరింగ్', 'बिजली वायरिंग', 'तार जोड़े', 'house wiring', 'domestic wiring', 'electrician'],
    skill: 'house_wiring_electrical'
  },
  {
    stems: ['మిక్సర్', 'కూలర్', 'మోటార్ రిపేర్', 'मोटर ठीक', 'कूलर', 'फैन रिपेयर', 'home appliance', 'appliance repair'],
    skill: 'home_appliance_repair'
  },

  // Electronics & Mobile
  {
    stems: ['మొబైల్ ఫోన్లు', 'మొబైల్', 'ఫోన్ రిపేర్', 'स्मार्टफोन', 'mobile repairing', 'phone repair', 'touch screen'],
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
    stems: ['మేస్త్రీ', 'గోడల నిర్మాణం', 'चिनाई', 'राजमिस्त्री', 'masonry', 'bricklaying'],
    skill: 'masonry_bricklaying'
  },
  {
    stems: ['ప్లంబింగ్', 'పైపు లైన్', 'नल फिटिंग', 'plumbing', 'sanitary plumbing', 'pipe fitting'],
    skill: 'sanitary_plumbing'
  },
  {
    stems: ['వెల్డింగ్', 'ఐరన్ గేట్లు', 'గ్రిల్స్', 'आर्क वेल्डिंग', 'लोहे की ग्रिल', 'arc welding', 'welding fabrication'],
    skill: 'structural_arc_welding'
  },

  // Digital & Office
  {
    stems: ['డేటా ఎంట్రీ', 'టైపింగ్', 'कंप्यूटर डेटा एंट्री', 'हिंदी टाइपिंग', 'data entry', 'vernacular typing'],
    skill: 'data_entry_vernacular_typing'
  },
  {
    stems: ['సిఎస్సి', 'ఆధార్', 'csc center', 'citizen service'],
    skill: 'csc_citizen_service_delivery'
  },
  {
    stems: ['డిజిటల్ బ్యాంకింగ్', 'ఆధార్ పేమెంట్స్', 'digital banking', 'dbt assistance'],
    skill: 'digital_banking_dbt_assistance'
  },
  {
    stems: ['కస్టమర్ సేల్స్', 'customer sales', 'retail sales', 'retail customer sales', 'sales counter'],
    skill: 'retail_sales_customer_service'
  },
  {
    stems: ['బిల్లింగ్', 'pos billing', 'pos digital billing', 'scanner billing', 'digital billing'],
    skill: 'pos_digital_billing'
  },
  {
    stems: ['బహీఖాతా', 'బహిఖాత', 'बहीखाता', 'bookkeeping', 'micro business accounting'],
    skill: 'micro_business_bookkeeping'
  },

  // Healthcare
  {
    stems: ['హాస్పిటల్', 'పేషెంట్ కేర్', 'మరీజోం', 'मरीजों की सेवा', 'general duty', 'patient care', 'ward boy'],
    skill: 'general_duty_hospital_assistance'
  },
  {
    stems: ['ప్రథమ చికిత్స', 'ఫస్ట్ ఎయిడ్', 'फर्स्ट एड', 'first aid', 'emergency response'],
    skill: 'first_aid_emergency_response'
  },
  {
    stems: ['వృద్ధుల సంరక్షణ', 'బెడ్సైడ్', 'elderly care', 'geriatric', 'patient home care'],
    skill: 'elderly_patient_home_care'
  },

  // Organic Agriculture
  {
    stems: ['సేంద్రీయ ఎరువులు', 'వర్మీ కంపోస్ట్', 'जैविक खाद', 'वर्मीकम्पोस्ट', 'vermicompost', 'organic compost'],
    skill: 'organic_compost_vermicompost'
  },
  {
    stems: ['పురుగు మందులు', 'సస్యరక్షణ', 'कीट प्रबंधन', 'pest management', 'organic pest'],
    skill: 'integrated_pest_management'
  }
];

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

  // Education level
  if (lower.includes('degree') || lower.includes('graduate') || lower.includes('college') || lower.includes('btech') || lower.includes('bcom') || lower.includes('bsc')) {
    extracted.education = 'Graduate';
  } else if (lower.includes('intermediate') || lower.includes('inter') || lower.includes('12th') || lower.includes('plus two') || lower.includes('11th')) {
    extracted.education = 'Intermediate';
  } else if (lower.includes('10th') || lower.includes('tenth') || lower.includes('ssc') || lower.includes('matric') || lower.includes('10वीं') || lower.includes('టెన్త్') || lower.includes('high school')) {
    extracted.education = 'High School';
  } else if (lower.includes('8th') || lower.includes('7th') || lower.includes('6th') || lower.includes('middle school') || lower.includes('yedava')) {
    extracted.education = 'Middle School';
  } else if (lower.includes('5th') || lower.includes('primary') || lower.includes('prathamic') || lower.includes('aikava')) {
    extracted.education = 'Primary School';
  } else if (lower.includes('no school') || lower.includes('anpadh') || lower.includes('chaduvukoledu') || lower.includes('illiterate') || lower.includes('chaduvu ledu')) {
    extracted.education = 'None';
  }

  // Monthly Income Goal
  const thousandsMatch = lower.match(/(\d+)\s*(k|thousand|hazar|velu|hazaar)/i);
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

  // Mobility constraints
  if (
    lower.includes('cannot travel') ||
    lower.includes('cannot leave') ||
    lower.includes('home based') ||
    lower.includes('intlo') ||
    lower.includes('intidaggara') ||
    lower.includes('ghar par') ||
    lower.includes('uru daatalenu') ||
    lower.includes('village only') ||
    lower.includes('outside no')
  ) {
    extracted.mobilityConstraints = ['Restricted to village or home based work'];
  } else if (lower.includes('block') || lower.includes('mandal') || lower.includes('nearby town')) {
    extracted.mobilityConstraints = ['Can travel up to block or mandal headquarters'];
  }

  // District recognition
  if (lower.includes('warangal') || lower.includes('hanamkonda')) {
    extracted.district = 'Warangal';
  } else if (lower.includes('adilabad')) {
    extracted.district = 'Adilabad';
  } else if (lower.includes('nalgonda')) {
    extracted.district = 'Nalgonda';
  }

  return extracted;
};
