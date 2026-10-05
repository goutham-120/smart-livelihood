/**
 * Multilingual and Regional Dialect Registry for PM-AJAY AI Voice Assistant
 * Full support for 22 Scheduled Indian Languages (Eighth Schedule of the Constitution of India) + English.
 * Provides:
 * - ISO codes, BCP-47 tags, native scripts, Unicode ranges
 * - Verified provider capability matrix (Sarvam AI, Bhashini, WebSpeech, Gemini)
 * - Deterministic Script and Morpho-Lexical Language Identification (LID)
 */

export const SCHEDULED_LANGUAGES_LIST = [
  'Assamese', 'Bengali', 'Bodo', 'Dogri', 'Gujarati', 'Hindi',
  'Kannada', 'Kashmiri', 'Konkani', 'Maithili', 'Malayalam', 'Manipuri',
  'Marathi', 'Nepali', 'Odia', 'Punjabi', 'Sanskrit', 'Santali',
  'Sindhi', 'Tamil', 'Telugu', 'Urdu'
];

export const SCHEDULED_23_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN', script: 'Latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', script: 'Bengali' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', script: 'Tamil' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', script: 'Telugu' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN', script: 'Gujarati' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN', script: 'Malayalam' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', script: 'Devanagari' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', script: 'Gurmukhi' },
  { code: 'od', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'od-IN', script: 'Odia' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', speechCode: 'as-IN', script: 'Bengali-Assamese' },
  { code: 'ur', name: 'Urdu', nativeName: 'اُردُو', speechCode: 'ur-IN', script: 'Perso-Arabic' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', speechCode: 'ne-IN', script: 'Devanagari' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', speechCode: 'kok-IN', script: 'Devanagari' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', speechCode: 'ks-IN', script: 'Perso-Arabic' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', speechCode: 'sd-IN', script: 'Perso-Arabic' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', speechCode: 'sa-IN', script: 'Devanagari' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', speechCode: 'sat-IN', script: 'Ol Chiki' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', speechCode: 'mni-IN', script: 'Bengali' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', speechCode: 'brx-IN', script: 'Devanagari' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', speechCode: 'mai-IN', script: 'Devanagari' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', speechCode: 'doi-IN', script: 'Devanagari' }
];

export const SUPPORTED_LANGUAGES = {
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    script: 'Telugu',
    unicodeRange: /[\u0C00-\u0C7F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [
      { id: 'telangana', name: 'Telangana', hint: 'Warangal, Adilabad, Hyderabad vernacular vocabulary' },
      { id: 'rayalaseema', name: 'Rayalaseema', hint: 'Kurnool, Anantapur, Kadapa colloquial patterns' },
      { id: 'coastal', name: 'Coastal Andhra', hint: 'Krishna, Guntur, Godavari regional style' },
      { id: 'standard', name: 'Standard Telugu', hint: 'Standard modern formal and informal Telugu' }
    ],
    defaultDialect: 'telangana'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    script: 'Devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [
      { id: 'bhojpuri', name: 'Bhojpuri', hint: 'Bhojpuri regional colloquial phrasing' },
      { id: 'awadhi', name: 'Awadhi', hint: 'Awadhi regional dialect phrasing' },
      { id: 'marwari', name: 'Marwari', hint: 'Marwari and Rajasthani conversational terms' },
      { id: 'chhattisgarhi', name: 'Chhattisgarhi', hint: 'Chhattisgarhi vernacular terms' },
      { id: 'standard', name: 'Standard Hindi', hint: 'Everyday clear conversational Hindi' }
    ],
    defaultDialect: 'standard'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechCode: 'en-IN',
    script: 'Latin',
    unicodeRange: /[a-zA-Z]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [
      { id: 'indian', name: 'Indian English', hint: 'Clear Indian English with vernacular loan words' }
    ],
    defaultDialect: 'indian'
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    script: 'Tamil',
    unicodeRange: /[\u0B80-\u0BFF]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Tamil', hint: 'Everyday colloquial Tamil' }],
    defaultDialect: 'standard'
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    script: 'Kannada',
    unicodeRange: /[\u0C80-\u0CFF]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Kannada', hint: 'Everyday colloquial Kannada' }],
    defaultDialect: 'standard'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    script: 'Devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Marathi', hint: 'Everyday colloquial Marathi' }],
    defaultDialect: 'standard'
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    script: 'Bengali',
    unicodeRange: /[\u0980-\u09FF]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Bengali', hint: 'Everyday colloquial Bengali' }],
    defaultDialect: 'standard'
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    speechCode: 'gu-IN',
    script: 'Gujarati',
    unicodeRange: /[\u0A80-\u0AFF]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Gujarati', hint: 'Everyday colloquial Gujarati' }],
    defaultDialect: 'standard'
  },
  or: {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'od-IN',
    script: 'Odia',
    unicodeRange: /[\u0B00-\u0B7F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Odia', hint: 'Everyday colloquial Odia' }],
    defaultDialect: 'standard'
  },
  od: {
    code: 'od',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'od-IN',
    script: 'Odia',
    unicodeRange: /[\u0B00-\u0B7F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Odia', hint: 'Everyday colloquial Odia' }],
    defaultDialect: 'standard'
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    script: 'Malayalam',
    unicodeRange: /[\u0D00-\u0D7F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Malayalam', hint: 'Everyday colloquial Malayalam' }],
    defaultDialect: 'standard'
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    speechCode: 'pa-IN',
    script: 'Gurmukhi',
    unicodeRange: /[\u0A00-\u0A7F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: true,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Punjabi', hint: 'Everyday colloquial Punjabi' }],
    defaultDialect: 'standard'
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اُردُو',
    speechCode: 'ur-IN',
    script: 'Perso-Arabic',
    unicodeRange: /[\u0600-\u06FF]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: true,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Urdu', hint: 'Everyday conversational Urdu' }],
    defaultDialect: 'standard'
  },
  as: {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    speechCode: 'as-IN',
    script: 'Bengali-Assamese',
    unicodeRange: /[\u0980-\u09FF]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Assamese', hint: 'Everyday colloquial Assamese' }],
    defaultDialect: 'standard'
  },
  ne: {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    speechCode: 'ne-IN',
    script: 'Devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: true,
      bhashiniTts: true,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Nepali', hint: 'Conversational Nepali' }],
    defaultDialect: 'standard'
  },
  sa: {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    speechCode: 'sa-IN',
    script: 'Devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: true,
      bhashiniTts: false,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Classical Sanskrit', hint: 'Simple spoken Sanskrit' }],
    defaultDialect: 'standard'
  },
  mai: {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    speechCode: 'mai-IN',
    script: 'Devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: true,
      bhashiniTts: false,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Maithili', hint: 'Mithila regional vocabulary' }],
    defaultDialect: 'standard'
  },
  kok: {
    code: 'kok',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    speechCode: 'kok-IN',
    script: 'Devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: true,
      bhashiniTts: false,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Konkani', hint: 'Goan and Coastal Konkani' }],
    defaultDialect: 'standard'
  },
  ks: {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'कॉशुर',
    speechCode: 'ks-IN',
    script: 'Perso-Arabic / Devanagari',
    unicodeRange: /[\u0600-\u06FF\u0900-\u097F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: false,
      bhashiniTts: false,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Kashmiri', hint: 'Valley conversational Kashmiri' }],
    defaultDialect: 'standard'
  },
  brx: {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बड़ो',
    speechCode: 'brx-IN',
    script: 'Devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: false,
      bhashiniTts: false,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Bodo', hint: 'Bodoland regional vocabulary' }],
    defaultDialect: 'standard'
  },
  doi: {
    code: 'doi',
    name: 'Dogri',
    nativeName: 'डोगरी',
    speechCode: 'doi-IN',
    script: 'Devanagari',
    unicodeRange: /[\u0900-\u097F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: false,
      bhashiniTts: false,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Dogri', hint: 'Jammu region conversational Dogri' }],
    defaultDialect: 'standard'
  },
  mni: {
    code: 'mni',
    name: 'Manipuri',
    nativeName: 'মৈতৈলোন্',
    speechCode: 'mni-IN',
    script: 'Bengali / Meetei Mayek',
    unicodeRange: /[\u0980-\u09FF\uABC0-\uABFF]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: false,
      bhashiniTts: false,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Manipuri', hint: 'Meitei vernacular terms' }],
    defaultDialect: 'standard'
  },
  sat: {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    speechCode: 'sat-IN',
    script: 'Ol Chiki',
    unicodeRange: /[\u1C50-\u1C7F]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: false,
      bhashiniTts: false,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Santali', hint: 'Ol Chiki vernacular' }],
    defaultDialect: 'standard'
  },
  sd: {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي',
    speechCode: 'sd-IN',
    script: 'Perso-Arabic',
    unicodeRange: /[\u0600-\u06FF]/,
    providerSupport: {
      sarvamStt: true,
      sarvamTts: false,
      bhashiniStt: false,
      bhashiniTts: false,
      webSpeech: false,
      gemini: true
    },
    dialects: [{ id: 'standard', name: 'Standard Sindhi', hint: 'Sindhi conversational terms' }],
    defaultDialect: 'standard'
  }
};

/**
 * Normalizes any language code or name to canonical ISO code (e.g. 'te-IN' -> 'te', 'telugu' -> 'te')
 */
export const normalizeLanguageCode = (input) => {
  if (!input) return 'en';
  const clean = String(input).trim().toLowerCase();
  if (SUPPORTED_LANGUAGES[clean]) return clean;

  const baseCode = clean.split('-')[0].split('_')[0];
  if (SUPPORTED_LANGUAGES[baseCode]) return baseCode;

  // Search by name or speechCode
  for (const [key, lang] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (lang.speechCode.toLowerCase() === clean) return key;
    if (lang.name.toLowerCase() === clean) return key;
    if (lang.nativeName.toLowerCase() === clean) return key;
  }

  // Alias checks
  if (clean === 'od' || clean === 'oriya') return 'or';
  if (clean === 'bangla') return 'bn';
  if (clean === 'meitei') return 'mni';

  return 'en';
};

export const getLanguageConfig = (code) => {
  const norm = normalizeLanguageCode(code);
  return SUPPORTED_LANGUAGES[norm] || SUPPORTED_LANGUAGES.en;
};

/**
 * Lexical markers for disambiguating languages using shared scripts (Devanagari, Bengali-Assamese, Perso-Arabic)
 */
const LEXICAL_PATTERNS = {
  mr: /(?:^|[^\p{L}\p{M}])(आहे|आहेत|आहात|कसे|कसा|कशी|नाही|नाहीत|करा|करावे|करतो|करते|मला|तुला|आणि|येते|शिकायचे|पाहिजे|होय|नमस्कार|काय|झाले|करायचे|हवे|हवा|शिका|व्यवसाय|कर्ज)(?:$|[^\p{L}\p{M}])|\u0933/iu, // ळ is unique to Marathi in Devanagari
  ne: /(?:^|[^\p{L}\p{M}])(छ|छैन|छन्|गर्छु|गर्न|हुन्छ|भयो|मलाई|हामी|सिक्न|चाहन्छु|चाहिन्छ|तालिम|जागिर)(?:$|[^\p{L}\p{M}])/iu,
  sa: /(?:^|[^\p{L}\p{M}])(अस्ति|भवति|अस्मि|भवन्ति|कार्यम्|करोमि|नमो|कुशलम्|कथम्|इच्छामि|अहं|सूचीकर्म|प्रशिक्षणम्|वाञ्छामि|मह्यम्|अध्यापकस्य|उद्योगः|आवश्यकः|वर्तते)(?:$|[^\p{L}\p{M}])/iu,
  mai: /(?:^|[^\p{L}\p{M}])(अछि|छैन|हम|हमर|हमरा|कऽ|करब|छी|अहाँ|कोनो|चाही|प्रशिक्षण)(?:$|[^\p{L}\p{M}])/iu,
  kok: /(?:^|[^\p{L}\p{M}])(आसा|म्हणून|म्हाका|तुका|करपाक|जाय)(?:$|[^\p{L}\p{M}])/iu,
  doi: /(?:^|[^\p{L}\p{M}])(ऐ|न|कम्म|करना|आखी|गल्ल|चाहिदी|दी)(?:$|[^\p{L}\p{M}])/iu,
  brx: /(?:^|[^\p{L}\p{M}])(आं|आंनो|खालाम|माव|नों|गनांगौ|नांगौ|फोरोंथाय)(?:$|[^\p{L}\p{M}])/iu,
  hi: /\b(है|हैं|का|की|के|में|से|को|मुझे|काम|सीखना|करना|नमस्ते|बताइए|सकता|सकती|चाहता|चाहती|दुकान|ट्रेनिंग)\b/i,

  // Assamese vs Bengali
  mni: /(?:^|[^\p{L}\p{M}])(ঐহাক|ঐহাক্না|লৌনিংই|ত্রেনিং|মৈতৈলোন্|থবক)(?:$|[^\p{L}\p{M}])/iu,
  as: /[\u09F0\u09F1]|(?:^|[^\p{L}\p{M}])(মই|আছে|কৰিব|কওক|শিকিব|কাম|খুজিছো|নমস্কাৰ|দৰ্জীৰ|দৰ্জী|প্ৰশিক্ষণ|বিচাৰো|আঁচনি)(?:$|[^\p{L}\p{M}])/iu,
  bn: /(?:^|[^\p{L}\p{M}])(আমি|আছে|করতে|বলুন|শিখতে|কাজ|চাই|নমস্কার|ধন্যবাদ|ভালো|দর্জির|দর্জি|প্রশিক্ষণ|প্রকল্প)(?:$|[^\p{L}\p{M}])/iu,

  // Urdu vs Sindhi/Kashmiri
  ks: /(?:^|[^\p{L}\p{M}])(چھُ|میٚے|میٚہ|پَہیجے|ہیکہٕ|تُہندِ|کۄرسَن|پَزان|نۄکری|چھِ|مُعَلِم)(?:$|[^\p{L}\p{M}])/iu,
  sd: /(?:^|[^\p{L}\p{M}])(آهيان|آهي|گهرجي|ڪورس|اوھان|ٿو|ٿي)(?:$|[^\p{L}\p{M}])/iu,
  ur: /(?:^|[^\p{L}\p{M}])(ہے|ہیں|مجھے|کام|کرنا|سیکھنا|سلام|آپ|چاہتا|چاہتی|شکریہ|درزی|تربیت|اسکیم)(?:$|[^\p{L}\p{M}])/iu
};

/**
 * Deterministic Language Identification (LID) from text.
 * Analyzes Unicode script blocks and lexical stop-words to return structured language detection.
 *
 * @param {string} text - The input text to identify
 * @returns {object} { language, languageName, nativeName, speechCode, confidence, script }
 */
export const detectLanguageFromText = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      language: 'en',
      languageName: 'English',
      nativeName: 'English',
      speechCode: 'en-IN',
      confidence: 0.5,
      script: 'Latin'
    };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return {
      language: 'en',
      languageName: 'English',
      nativeName: 'English',
      speechCode: 'en-IN',
      confidence: 0.5,
      script: 'Latin'
    };
  }

  // Count characters belonging to script blocks
  const scriptCounts = {
    Telugu: (trimmed.match(/[\u0C00-\u0C7F]/g) || []).length,
    Tamil: (trimmed.match(/[\u0B80-\u0BFF]/g) || []).length,
    Kannada: (trimmed.match(/[\u0C80-\u0CFF]/g) || []).length,
    Malayalam: (trimmed.match(/[\u0D00-\u0D7F]/g) || []).length,
    Gujarati: (trimmed.match(/[\u0A80-\u0AFF]/g) || []).length,
    Gurmukhi: (trimmed.match(/[\u0A00-\u0A7F]/g) || []).length,
    Odia: (trimmed.match(/[\u0B00-\u0B7F]/g) || []).length,
    BengaliAssamese: (trimmed.match(/[\u0980-\u09FF]/g) || []).length,
    Devanagari: (trimmed.match(/[\u0900-\u097F]/g) || []).length,
    PersoArabic: (trimmed.match(/[\u0600-\u06FF]/g) || []).length,
    OlChiki: (trimmed.match(/[\u1C50-\u1C7F]/g) || []).length,
    Latin: (trimmed.match(/[a-zA-Z]/g) || []).length
  };

  // Find dominant script
  let dominantScript = 'Latin';
  let maxCount = scriptCounts.Latin;

  for (const [script, count] of Object.entries(scriptCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantScript = script;
    }
  }

  const totalIndicChars = Object.entries(scriptCounts)
    .filter(([k]) => k !== 'Latin')
    .reduce((sum, [, v]) => sum + v, 0);

  // If mostly Latin, check for Romanized Indic languages before defaulting to English
  if (dominantScript === 'Latin' && totalIndicChars === 0) {
    const lowerTrimmed = trimmed.toLowerCase();

    // 1. Romanized Telugu
    const isRomanizedTelugu = /(?:^|[^\p{L}])(ela\s+unnavu|ela\s+unnav|yela\s+unnavu|yela\s+unnav|ela\s+unnaru|yela\s+unnaru|yela\s+unnar|meeru\s+ela|naaku|naku|kavali|kavale|kaavali|kaavale|chustunnanu|chustunna|chusthunanu|chusthuna|nenu|chesanu|cheyali|cheyyali|cheppandi|cheppu|cheyandi|cheyyandi|unnanu|unnara|bagunnanu|bavunnanu|bagunna|bavunna|bagundi|bavundi|bagunnara|bavunnara|bagunnava|bavunnava|namaskaram|namaskaramu|kuttupani|pashuposhana|chenetha|sontamga|sontanga|nerchukovali|pettukovali|udhyogam|udyogam|jeetham|shikshana|manchi|pani|enti|emiti|ekkada|epudu|meeru|maku|manaki|dhanyavadalu|dhanyavadamulu|danyavadalu|danyavadamulu|daggaralo|daggara|chesukovali|telusukovali|nerpandi|sahayam|sahayamu|pathakam|pathakalu|vyaparam)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedTelugu) {
      return {
        language: 'te',
        languageName: 'Telugu',
        nativeName: 'తెలుగు',
        speechCode: 'te-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 1b. Romanized Kannada (checked before Hindi/Tamil so Kannada morphology like
    // "nanage ... bekagide" is not misclassified when the browser STT returns Latin text).
    // Includes common browser-STT spellings (nanagi, bekagi de, udyoga, shikshakara).
    const kannadaJoined = lowerTrimmed.replace(/\s+/g, '');
    const isRomanizedKannadaEarly =
      /(?:^|[^\p{L}])(nanage|nanagi|nange|naanu|nanu|nimage|nimma|namma|beku|bekagide|bekagi|bekaagide|bekittu|beda|kelasa|kelsa|udyoga|udyogavannu|shikshaka|shikshakara|shikshakaru|tarabeti|yojane|yojanegalu|hegiddira|hegiddiri|hegide|namaskara|chennagiddini|maadi|kodi|heli|helu|ide|ideya|alli|yelli|yenu|swalpa|dhanyavadagalu)(?:$|[^\p{L}])/iu.test(lowerTrimmed) ||
      /(bekagide|bekaagide|nanagebeku|kelasabeku|udyogabeku)/.test(kannadaJoined);
    if (isRomanizedKannadaEarly) {
      return {
        language: 'kn',
        languageName: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
        speechCode: 'kn-IN',
        confidence: 0.9,
        script: 'Latin'
      };
    }

    // 2. Romanized Urdu (checked before Hindi to catch distinct Urdu markers like adaab, mulazmat, etc.)
    const isRomanizedUrdu = /(?:^|[^\p{L}])(adaab|khuda\s+hafiz|shukriya|janab|mulazmat|tarbiyat|aap\s+kaise\s+hain)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedUrdu) {
      return {
        language: 'ur',
        languageName: 'Urdu',
        nativeName: 'اُردُو',
        speechCode: 'ur-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 3. Romanized Hindi
    const isRomanizedHindi = /(?:^|[^\p{L}])(aap\s+kaise\s+ho|kaise\s+ho|kese\s+ho|kaisa\s+ho|kaisa\s+hai|kya\s+haal|kya\s+hal|kaise\s+hain|mujhe|chahiye|karna\s+hai|karna\s+chahta|karna\s+chahti|chahta\s+hoon|chahti\s+hoon|seekhna|sikhna|naukri|namaste|dhanyawad|dhanyavad|batao|bataiye|bataye|theek\s+hai|theek\s+hoon|thik\s+hu|achha|accha|rozgar|kripya|yojana|yojna|jankari|jaankari|nazdeek|paas\s+mein|kholna|shuru|vyapar|madad)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedHindi) {
      return {
        language: 'hi',
        languageName: 'Hindi',
        nativeName: 'हिन्दी',
        speechCode: 'hi-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 4. Romanized Tamil
    const isRomanizedTamil = /(?:^|[^\p{L}])(eppadi\s+irukkeenga|eppadi\s+irukinga|epdi\s+irukinga|epadi\s+irukinga|eppadi\s+irukireergal|eppadi\s+irukeenga|eppadi\s+iruka|enakku|velai|vendum|venum|payirchi|nalla\s+irukken|nalla\s+iruken|solleenga|sollunga|vanakkam|theriyum|puriyala|solla\s+mudiyuma)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedTamil) {
      return {
        language: 'ta',
        languageName: 'Tamil',
        nativeName: 'தமிழ்',
        speechCode: 'ta-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 5. Romanized Kannada
    const isRomanizedKannada = /(?:^|[^\p{L}])(hegiddira|hegiddiri|hegidhdhira|hegidira|hegidiri|hegide|namaskara|nanage|kelasa|beku|chennagiddini|chennagidini|heli)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedKannada) {
      return {
        language: 'kn',
        languageName: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
        speechCode: 'kn-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 6. Romanized Malayalam
    const isRomanizedMalayalam = /(?:^|[^\p{L}])(sukhamano|sukhumarno|sukhamane|sukham\s+aano|sukhamaano|sukhamundo|sukamano|sukham|namaskaram|enikku|joli|venam|enthaanu|pattumo)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedMalayalam) {
      return {
        language: 'ml',
        languageName: 'Malayalam',
        nativeName: 'മലയാളം',
        speechCode: 'ml-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 6. Romanized Marathi
    const isRomanizedMarathi = /(?:^|[^\p{L}])(kasa\s+ahes|kase\s+ahat|kashi\s+ahes|mala\s+kam|mala\s+naukri|mala\s+training|shikayche\s+ahe|pahije|namaskar)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedMarathi) {
      return {
        language: 'mr',
        languageName: 'Marathi',
        nativeName: 'मराठी',
        speechCode: 'mr-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 7. Romanized Bengali
    const isRomanizedBengali = /(?:^|[^\p{L}])(kemon\s+acho|kemon\s+achen|kemon\s+achish|amar|ekta|chakri|kaj\s+chai|dorkar|shikhbo|shikhte\s+chai|nomoshkar|dhonnobad)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedBengali) {
      return {
        language: 'bn',
        languageName: 'Bengali',
        nativeName: 'বাংলা',
        speechCode: 'bn-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 8. Romanized Gujarati
    const isRomanizedGujarati = /(?:^|[^\p{L}])(kem\s+cho|kem\s+chho|mane\s+training|mane\s+naukri|kam\s+joiye|joiye|shikhvu\s+chhe|aabhar)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedGujarati) {
      return {
        language: 'gu',
        languageName: 'Gujarati',
        nativeName: 'ગુજરાતી',
        speechCode: 'gu-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 9. Romanized Punjabi
    const isRomanizedPunjabi = /(?:^|[^\p{L}])(kiddan|ki\s+haal|mainu\s+training|mainu\s+naukri|kam\s+chahida|chahidi|sat\s+sri\s+akaal|dhanwad)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedPunjabi) {
      return {
        language: 'pa',
        languageName: 'Punjabi',
        nativeName: 'ਪੰਜਾਬੀ',
        speechCode: 'pa-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // 10. Romanized Odia
    const isRomanizedOdia = /(?:^|[^\p{L}])(kemiti\s+achanti|kemiti\s+acho|mate\s+training|mate\s+chakiri|kam\s+darkar|darkar|shikhibaku\s+chahe|namaskar)(?:$|[^\p{L}])/iu.test(lowerTrimmed);
    if (isRomanizedOdia) {
      return {
        language: 'or',
        languageName: 'Odia',
        nativeName: 'ଓଡ଼ିଆ',
        speechCode: 'od-IN',
        confidence: 0.95,
        script: 'Latin'
      };
    }

    // Standard English
    return {
      language: 'en',
      languageName: 'English',
      nativeName: 'English',
      speechCode: 'en-IN',
      confidence: 0.95,
      script: 'Latin'
    };
  }

  // Calculate script confidence
  const scriptConfidence = Math.min(0.99, Math.max(0.70, (maxCount / (maxCount + (scriptCounts.Latin * 0.5))) || 0.85));

  // 1. Direct 1-to-1 script mappings
  if (dominantScript === 'Telugu') {
    return {
      language: 'te',
      languageName: 'Telugu',
      nativeName: 'తెలుగు',
      speechCode: 'te-IN',
      confidence: scriptConfidence,
      script: 'Telugu'
    };
  }
  if (dominantScript === 'Tamil') {
    return {
      language: 'ta',
      languageName: 'Tamil',
      nativeName: 'தமிழ்',
      speechCode: 'ta-IN',
      confidence: scriptConfidence,
      script: 'Tamil'
    };
  }
  if (dominantScript === 'Kannada') {
    return {
      language: 'kn',
      languageName: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
      speechCode: 'kn-IN',
      confidence: scriptConfidence,
      script: 'Kannada'
    };
  }
  if (dominantScript === 'Malayalam') {
    return {
      language: 'ml',
      languageName: 'Malayalam',
      nativeName: 'മലയാളം',
      speechCode: 'ml-IN',
      confidence: scriptConfidence,
      script: 'Malayalam'
    };
  }
  if (dominantScript === 'Gujarati') {
    return {
      language: 'gu',
      languageName: 'Gujarati',
      nativeName: 'ગુજરાતી',
      speechCode: 'gu-IN',
      confidence: scriptConfidence,
      script: 'Gujarati'
    };
  }
  if (dominantScript === 'Gurmukhi') {
    return {
      language: 'pa',
      languageName: 'Punjabi',
      nativeName: 'ਪੰਜਾਬੀ',
      speechCode: 'pa-IN',
      confidence: scriptConfidence,
      script: 'Gurmukhi'
    };
  }
  if (dominantScript === 'Odia') {
    return {
      language: 'or',
      languageName: 'Odia',
      nativeName: 'ଓଡ଼ିଆ',
      speechCode: 'od-IN',
      confidence: scriptConfidence,
      script: 'Odia'
    };
  }
  if (dominantScript === 'OlChiki') {
    return {
      language: 'sat',
      languageName: 'Santali',
      nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
      speechCode: 'sat-IN',
      confidence: scriptConfidence,
      script: 'Ol Chiki'
    };
  }

  // 2. Bengali vs Assamese vs Manipuri
  if (dominantScript === 'BengaliAssamese') {
    if (LEXICAL_PATTERNS.mni && LEXICAL_PATTERNS.mni.test(trimmed)) {
      return {
        language: 'mni',
        languageName: 'Manipuri',
        nativeName: 'মৈতৈলোন্',
        speechCode: 'mni-IN',
        confidence: scriptConfidence,
        script: 'Bengali'
      };
    }
    if (LEXICAL_PATTERNS.as.test(trimmed)) {
      return {
        language: 'as',
        languageName: 'Assamese',
        nativeName: 'অসমীয়া',
        speechCode: 'as-IN',
        confidence: scriptConfidence,
        script: 'Bengali-Assamese'
      };
    }
    return {
      language: 'bn',
      languageName: 'Bengali',
      nativeName: 'বাংলা',
      speechCode: 'bn-IN',
      confidence: scriptConfidence,
      script: 'Bengali'
    };
  }

  // 3. Perso-Arabic (Urdu, Kashmiri, Sindhi)
  if (dominantScript === 'PersoArabic') {
    if (LEXICAL_PATTERNS.ks && LEXICAL_PATTERNS.ks.test(trimmed)) {
      return {
        language: 'ks',
        languageName: 'Kashmiri',
        nativeName: 'कॉशुर',
        speechCode: 'ks-IN',
        confidence: scriptConfidence,
        script: 'Perso-Arabic'
      };
    }
    if (LEXICAL_PATTERNS.sd && LEXICAL_PATTERNS.sd.test(trimmed)) {
      return {
        language: 'sd',
        languageName: 'Sindhi',
        nativeName: 'سنڌي',
        speechCode: 'sd-IN',
        confidence: scriptConfidence,
        script: 'Perso-Arabic'
      };
    }
    return {
      language: 'ur',
      languageName: 'Urdu',
      nativeName: 'اُردُو',
      speechCode: 'ur-IN',
      confidence: scriptConfidence,
      script: 'Perso-Arabic'
    };
  }

  // 4. Devanagari (Hindi, Marathi, Nepali, Sanskrit, Maithili, Konkani, Bodo, Dogri)
  if (dominantScript === 'Devanagari') {
    if (LEXICAL_PATTERNS.kok.test(trimmed)) {
      return {
        language: 'kok',
        languageName: 'Konkani',
        nativeName: 'कोंकणी',
        speechCode: 'kok-IN',
        confidence: 0.95,
        script: 'Devanagari'
      };
    }
    if (LEXICAL_PATTERNS.mr.test(trimmed)) {
      return {
        language: 'mr',
        languageName: 'Marathi',
        nativeName: 'मराठी',
        speechCode: 'mr-IN',
        confidence: 0.95,
        script: 'Devanagari'
      };
    }
    if (LEXICAL_PATTERNS.ne.test(trimmed)) {
      return {
        language: 'ne',
        languageName: 'Nepali',
        nativeName: 'नेपाली',
        speechCode: 'ne-IN',
        confidence: 0.94,
        script: 'Devanagari'
      };
    }
    if (LEXICAL_PATTERNS.sa.test(trimmed)) {
      return {
        language: 'sa',
        languageName: 'Sanskrit',
        nativeName: 'संस्कृतम्',
        speechCode: 'sa-IN',
        confidence: 0.92,
        script: 'Devanagari'
      };
    }
    if (LEXICAL_PATTERNS.mai.test(trimmed)) {
      return {
        language: 'mai',
        languageName: 'Maithili',
        nativeName: 'मैथिली',
        speechCode: 'mai-IN',
        confidence: 0.90,
        script: 'Devanagari'
      };
    }
    if (LEXICAL_PATTERNS.doi.test(trimmed)) {
      return {
        language: 'doi',
        languageName: 'Dogri',
        nativeName: 'डोगरी',
        speechCode: 'doi-IN',
        confidence: 0.88,
        script: 'Devanagari'
      };
    }
    if (LEXICAL_PATTERNS.brx.test(trimmed)) {
      return {
        language: 'brx',
        languageName: 'Bodo',
        nativeName: 'बड़ो',
        speechCode: 'brx-IN',
        confidence: 0.88,
        script: 'Devanagari'
      };
    }
    // Default Devanagari to Hindi
    return {
      language: 'hi',
      languageName: 'Hindi',
      nativeName: 'हिन्दी',
      speechCode: 'hi-IN',
      confidence: scriptConfidence,
      script: 'Devanagari'
    };
  }

  return {
    language: 'en',
    languageName: 'English',
    nativeName: 'English',
    speechCode: 'en-IN',
    confidence: 0.7,
    script: 'Latin'
  };
};

/**
 * Vernacular stage prompts for all top supported Indic languages.
 * Used for empathetic initial greetings and dialog fallbacks.
 */
export const STAGE_PROMPTS = {
  greeting_consent: {
    te: 'నమస్కారం! PM AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ నైపుణ్యాలను తెలుసుకుని మంచి ఉపాధి లేదా స్వయం ఉపాధి పథకాలను సిఫార్సు చేయడానికి మేము మీ వివరాలు నమోదు చేయవచ్చా? సరే అయితే అవును అని చెప్పండి.',
    hi: 'नमस्ते! PM AJAY आजीविका सहायक में आपका स्वागत है. आपके हुनर और अनुभव के आधार पर सही ट्रेनिंग और सरकारी योजना खोजने के लिए क्या हम बात शुरू कर सकते हैं? आगे बढ़ने के लिए हाँ कहें.',
    en: 'Namaste! Welcome to the PM AJAY Livelihood Assistant. May we record your details to recommend NSQF training and government livelihood pathways? Please say yes to proceed.',
    ta: 'வணக்கம்! PM AJAY வாழ்வாதார உதவியாளருக்கு வரவேற்கிறோம். உங்கள் திறன்களின் அடிப்படையில் சிறந்த பயிற்சி மற்றும் திட்டங்களைப் பெற உங்கள் விவரங்களைப் பதிவு செய்யலாமா?',
    kn: 'ನಮಸ್ಕಾರ! PM AJAY ಜೀವನಾಧಾರ ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳಿಗೆ ತಕ್ಕ ತರಬೇತಿ ಮತ್ತು ಸರಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಲು ಮಾತುಕತೆ ಆರಂಭಿಸೋಣವೇ?',
    mr: 'नमस्कार! PM AJAY उपजीविका सहाय्यकामध्ये आपले स्वागत आहे. आपल्या कौशल्यांवर आधारित योग्य प्रशिक्षण व शासकीय योजना शोधण्यासाठी आम्ही आपली माहिती नोंदवू शकतो का?',
    bn: 'নমস্কার! PM AJAY জীবিকা সহায়ক পোর্টালে আপনাকে স্বাগতম। আপনার দক্ষতা অনুযায়ী সঠিক প্রশিক্ষণ ও সরকারি সুযোগ পেতে আমরা কি আলোচনা শুরু করতে পারি?',
    gu: 'નમસ્તે! PM AJAY આજીવિકા સહાયકમાં આપનું સ્વાગત છે. આપની આવડત અને અનુભવ અનુસાર યોગ્ય તાલીમ અને યોજના શોધવા માટે આપણે વાત શરૂ કરી શકીએ?',
    or: 'ନମସ୍କାର! PM AJAY ଜୀବିକା ସହାୟକକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ଆପଣଙ୍କ ଦକ୍ଷତା ଅନୁଯାୟୀ ଉପଯୁକ୍ତ ପ୍ରଶିକ୍ଷଣ ଓ ସରକାରୀ ଯୋଜନା ପାଇଁ ଆମେ କଥାବାର୍ତ୍ତା ଆରମ୍ଭ କରିବା କି?',
    ml: 'നമസ്കാരം! PM AJAY ജീവനോപാധി അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ കഴിവിന് അനുയോജ്യമായ പരിശീലനങ്ങളും സർക്കാർ പദ്ധതികളും കണ്ടെത്താൻ നമുക്ക് സംസാരിക്കാമോ?',
    pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! PM AJAY ਰੋਜ਼ਗਾਰ ਸਹਾਇਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਤੁਹਾਡੇ ਹੁਨਰ ਅਨੁਸਾਰ ਸਿਖਲਾਈ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਲੱਭਣ ਲਈ ਕੀ ਅਸੀਂ ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੀਏ?',
    ur: 'آداب! PM AJAY روزگار اسسٹنٹ میں آپ کا خیر مقدم ہے۔ آپ کی مہارت اور تجربے کی بنیاد پر مناسب تربیت اور سرکاری اسکیمیں تجویز کرنے کے لیے کیا ہم بات شروع کر سکتے ہیں؟'
  }
};

/**
 * Normalizes vernacular and Romanized Indic speech to semantic intent and native interpretation.
 */
export const normalizeIndicUtterance = (text, langCode = 'te') => {
  const norm = normalizeLanguageCode(langCode);
  const trimmed = String(text || '').trim();
  const lower = trimmed.toLowerCase();

  // 1. Greeting / "How are you?"
  const isHowAreYou =
    /(?:^|[^\p{L}])(ela\s+unnavu|ela\s+unnav|yela\s+unnavu|yela\s+unnav|ela\s+unnaru|yela\s+unnaru|meeru\s+ela|bavunnara|bagunnara|bagunnava|bavunnava)(?:$|[^\p{L}])/iu.test(lower) ||
    trimmed.includes('ఎలా ఉన్నావు') || trimmed.includes('ఎలా ఉన్నారు') || trimmed.includes('బాగున్నారా') ||
    /(?:^|[^\p{L}])(aap\s+kaise\s+ho|kaise\s+ho|kese\s+ho|kaisa\s+ho|kaisa\s+hai|kya\s+haal|kya\s+hal|kaise\s+hain|aap\s+kaise\s+hain)(?:$|[^\p{L}])/iu.test(lower) ||
    trimmed.includes('आप कैसे हैं') || trimmed.includes('कैसे हो') || trimmed.includes('क्या हाल') ||
    /(?:^|[^\p{L}])(eppadi\s+irukkeenga|eppadi\s+irukinga|epdi\s+irukinga|epadi\s+irukinga|eppadi\s+irukireergal)(?:$|[^\p{L}])/iu.test(lower) ||
    trimmed.includes('எப்படி இருக்கீங்க') || trimmed.includes('எப்படி இருக்கிறீர்கள்') ||
    /(?:^|[^\p{L}])(how\s+are\s+you|how\s+do\s+you\s+do|how\s+are\s+u|how\s+r\s+u)(?:$|[^\p{L}])/iu.test(lower) ||
    /(?:^|[^\p{L}])(hegiddira|hegiddiri|hegidhdhira|hegidira|hegidiri|hegide)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ಹೇಗಿದ್ದೀರಾ') ||
    /(?:^|[^\p{L}])(sukhamano|sukhumarno|sukhamane|sukham\s+aano|sukhamaano|sukhamundo|sukamano|sukham)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('സുഖമാണോ') ||
    /(?:^|[^\p{L}])(kasa\s+ahes|kasa\s+aahes|kase\s+ahat|kase\s+aahat|kashi\s+ahes)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('कसे आहात') || trimmed.includes('कसा आहेस') ||
    /(?:^|[^\p{L}])(kemon\s+acho|kemon\s+achen|kemon\s+achish)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('কেমন আছেন') || trimmed.includes('কেমন আছো') ||
    /(?:^|[^\p{L}])(kem\s+cho|kem\s+chho)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('કેમ છો') ||
    /(?:^|[^\p{L}])(kiddan|ki\s+haal|ki\s+haal\s+hai)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ਕੀ ਹਾਲ ਹੈ') || trimmed.includes('ਕਿੱਦਾਂ') ||
    /(?:^|[^\p{L}])(kemiti\s+achanti|kemiti\s+acho)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('କେମିତି ଅଛନ୍ତି') || trimmed.includes('କେମିତି ଅଛୁ') ||
    /(?:^|[^\p{L}])(kya\s+haal\s+hai|aap\s+kaise\s+hain)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('کیا حال ہے') || trimmed.includes('آپ کیسے ہیں');

  if (isHowAreYou) {
    let normalizedText = 'How are you?';
    if (norm === 'te') normalizedText = 'ఎలా ఉన్నావు?';
    else if (norm === 'hi') normalizedText = 'आप कैसे हैं?';
    else if (norm === 'ta') normalizedText = 'எப்படி இருக்கிறீர்கள்?';
    else if (norm === 'kn') normalizedText = 'ಹೇಗಿದ್ದೀರಾ?';
    else if (norm === 'ml') normalizedText = 'സുഖമാണോ?';
    else if (norm === 'mr') normalizedText = 'कसे आहात?';
    else if (norm === 'bn') normalizedText = 'কেমন আছেন?';
    else if (norm === 'gu') normalizedText = 'કેમ છો?';
    else if (norm === 'pa') normalizedText = 'ਕੀ ਹਾਲ ਹੈ?';
    else if (norm === 'or') normalizedText = 'କେମିତି ଅଛନ୍ତି?';
    else if (norm === 'ur') normalizedText = 'آپ کیسے ہیں؟';

    return {
      intent: 'greeting_how_are_you',
      normalizedText,
      englishMeaning: 'How are you?'
    };
  }

  // 2. Training request
  const isTrainingRequest =
    /(?:^|[^\p{L}])(training\s+kavali|shikshana\s+kavali|nerchukovali|nerchukovalani)(?:$|[^\p{L}])/iu.test(lower) ||
    (lower.includes('training') && (lower.includes('kavali') || lower.includes('chustunna') || lower.includes('kavalenu'))) ||
    trimmed.includes('శిక్షణ కావాలి') || trimmed.includes('ట్రైనింగ్ కావాలి') || trimmed.includes('నేర్చుకోవాలి') ||
    /(?:^|[^\p{L}])(training\s+chahiye|prashikshan\s+chahiye|training\s+karna|seekhna\s+chahta|seekhna\s+chahti)(?:$|[^\p{L}])/iu.test(lower) ||
    (lower.includes('training') && (lower.includes('chahiye') || lower.includes('karna hai'))) ||
    trimmed.includes('प्रशिक्षण चाहिए') || trimmed.includes('ट्रेनिंग चाहिए') || trimmed.includes('सीखना चाहता') ||
    /(?:^|[^\p{L}])(training\s+vendum|payirchi\s+vendum)(?:$|[^\p{L}])/iu.test(lower) ||
    trimmed.includes('பயிற்சி வேண்டும்') || trimmed.includes('டிரெய்னிங் வேண்டும்') ||
    /(?:^|[^\p{L}])(training\s+beku|shikshana\s+beku)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ತರಬೇತಿ ಬೇಕು') ||
    /(?:^|[^\p{L}])(training\s+venam|pariseelanam\s+venam)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('പരിശീലനം വേണം') ||
    /(?:^|[^\p{L}])(training\s+havi|prashikshan\s+have|shikayche\s+ahe)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('प्रशिक्षण हवे') || trimmed.includes('शिकायचे आहे') ||
    /(?:^|[^\p{L}])(training\s+dorkar|training\s+chai|shikhbo)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('প্রশিক্ষণ দরকার') || trimmed.includes('ট্রেনিং চাই') ||
    /(?:^|[^\p{L}])(training\s+joiye|shikhvu\s+chhe)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('તાલીમ જોઈએ') || trimmed.includes('ટ્રેનિંગ જોઈએ') ||
    /(?:^|[^\p{L}])(training\s+chahidi|sikhna\s+hai)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ਸਿਖਲਾਈ ਚਾਹੀਦੀ') || trimmed.includes('ਟ੍ਰੇਨਿੰਗ ਚਾਹੀਦੀ') ||
    /(?:^|[^\p{L}])(training\s+darkar|shikhibaku\s+chahe)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ପ୍ରଶିକ୍ଷଣ ଦରକାର') ||
    /(?:^|[^\p{L}])(tarbiyat\s+chahiye|training\s+chahiye)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('تربیت چاہیے') ||
    /(?:^|[^\p{L}])(i\s+want\s+training|i\s+need\s+training|need\s+training|want\s+training|looking\s+for\s+training|training\s+required)(?:$|[^\p{L}])/iu.test(lower);

  if (isTrainingRequest) {
    let normalizedText = 'I want training';
    if (norm === 'te') normalizedText = 'నాకు శిక్షణ కావాలి';
    else if (norm === 'hi') normalizedText = 'मुझे ट्रेनिंग चाहिए';
    else if (norm === 'ta') normalizedText = 'எனக்கு பயிற்சி வேண்டும்';
    else if (norm === 'kn') normalizedText = 'ನನಗೆ ತರಬೇತಿ ಬೇಕು';
    else if (norm === 'ml') normalizedText = 'എനിക്ക് പരിശീലനം വേണം';
    else if (norm === 'mr') normalizedText = 'मला प्रशिक्षण हवे आहे';
    else if (norm === 'bn') normalizedText = 'আমার প্রশিক্ষণ দরকার';
    else if (norm === 'gu') normalizedText = 'મને તાલીમ જોઈએ છે';
    else if (norm === 'pa') normalizedText = 'ਮੈਨੂੰ ਸਿਖਲਾਈ ਚਾਹੀਦੀ ਹੈ';
    else if (norm === 'or') normalizedText = 'ମୋତେ ପ୍ରଶିକ୍ଷଣ ଦରକାର';
    else if (norm === 'ur') normalizedText = 'مجھے تربیت چاہیے';

    return {
      intent: 'request_training',
      normalizedText,
      englishMeaning: 'I want training'
    };
  }

  // 3. Job request
  const isJobRequest =
    /(?:^|[^\p{L}])(job\s+kavali|udyogam\s+kavali|udhyogam\s+kavali|pani\s+kavali|job\s+kosam)(?:$|[^\p{L}])/iu.test(lower) ||
    (lower.includes('job') && (lower.includes('kavali') || lower.includes('chustunnanu') || lower.includes('chustunna') || lower.includes('kosam'))) ||
    trimmed.includes('ఉద్యోగం కావాలి') || trimmed.includes('పని కావాలి') || trimmed.includes('జాబ్ కావాలి') ||
    /(?:^|[^\p{L}])(job\s+chahiye|naukri\s+chahiye|rozgar\s+chahiye|kaam\s+chahiye|naukari\s+chahiye)(?:$|[^\p{L}])/iu.test(lower) ||
    (lower.includes('job') && (lower.includes('chahiye') || lower.includes('dhoondh'))) ||
    trimmed.includes('नौकरी चाहिए') || trimmed.includes('रोजगार चाहिए') || trimmed.includes('काम चाहिए') ||
    /(?:^|[^\p{L}])(velai\s+vendum|job\s+vendum)(?:$|[^\p{L}])/iu.test(lower) ||
    trimmed.includes('வேலை வேண்டும்') ||
    /(?:^|[^\p{L}])(kelasa\s+beku|udyoga\s+beku)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ಕೆಲಸ ಬೇಕು') ||
    /(?:^|[^\p{L}])(joli\s+venam)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ജോലി വേണം') ||
    /(?:^|[^\p{L}])(kam\s+pahije|naukri\s+pahije)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('काम पाहिजे') || trimmed.includes('नोकरी पाहिजे') ||
    /(?:^|[^\p{L}])(chakri\s+lagbe|chakri\s+chai|kaj\s+chai)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('চাকরি চাই') || trimmed.includes('কাজ চাই') ||
    /(?:^|[^\p{L}])(naukri\s+joiye|kam\s+joiye)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('નોકરી જોઈએ') || trimmed.includes('કામ જોઈએ') ||
    /(?:^|[^\p{L}])(naukri\s+chahidi|kam\s+chahida)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ਨੌਕਰੀ ਚਾਹੀਦੀ') || trimmed.includes('ਕੰਮ ਚਾਹੀਦਾ') ||
    /(?:^|[^\p{L}])(chakiri\s+darkar|kam\s+darkar)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ଚାକିରି ଦରକାର') || trimmed.includes('କାମ ଦରକାର') ||
    /(?:^|[^\p{L}])(mulazmat\s+chahiye|naukri\s+chahiye|kaam\s+chahiye)(?:$|[^\p{L}])/iu.test(lower) || trimmed.includes('ملازمت چاہیے') ||
    /(?:^|[^\p{L}])(i\s+want\s+(?:a\s+)?job|i\s+need\s+(?:a\s+)?job|looking\s+for\s+(?:a\s+)?job|need\s+employment)(?:$|[^\p{L}])/iu.test(lower);

  if (isJobRequest) {
    let normalizedText = 'I want a job';
    if (norm === 'te') normalizedText = 'నాకు ఉద్యోగం కావాలి';
    else if (norm === 'hi') normalizedText = 'मुझे नौकरी चाहिए';
    else if (norm === 'ta') normalizedText = 'எனக்கு வேலை வேண்டும்';
    else if (norm === 'kn') normalizedText = 'ನನಗೆ ಕೆಲಸ ಬೇಕು';
    else if (norm === 'ml') normalizedText = 'എനിക്ക് ജോലി വേണം';
    else if (norm === 'mr') normalizedText = 'मला नोकरी पाहिजे';
    else if (norm === 'bn') normalizedText = 'আমার চাকরি দরকার';
    else if (norm === 'gu') normalizedText = 'મને નોકરી જોઈએ છે';
    else if (norm === 'pa') normalizedText = 'ਮੈਨੂੰ ਨੌਕਰੀ ਚਾਹੀਦੀ ਹੈ';
    else if (norm === 'or') normalizedText = 'ମୋତେ ଚାକିରି ଦରକାର';
    else if (norm === 'ur') normalizedText = 'مجھے ملازمت چاہیے';

    return {
      intent: 'request_job',
      normalizedText,
      englishMeaning: 'I want a job'
    };
  }

  // 4. Greeting
  const isGreeting =
    /(?:^|[^\p{L}])(namaskaram|namaskaramu|namaste|vanakkam|namaskara|namaskar|nomoshkar|pranam|sat\s+sri\s+akaal|adaab|hello|hi|hey)(?:$|[^\p{L}])/iu.test(lower) ||
    trimmed.includes('నమస్కారం') || trimmed.includes('नमस्ते') || trimmed.includes('வணக்கம்') || trimmed.includes('ನಮಸ್ಕಾರ') ||
    trimmed.includes('नमस्कार') || trimmed.includes('নমস্কার') || trimmed.includes('ਨਮਸਕਾਰ') || trimmed.includes('آداب');

  if (isGreeting) {
    let normalizedText = 'Hello';
    if (norm === 'te') normalizedText = 'నమస్కారం';
    else if (norm === 'hi') normalizedText = 'नमस्ते';
    else if (norm === 'ta') normalizedText = 'வணக்கம்';
    else if (norm === 'kn') normalizedText = 'ನಮಸ್ಕಾರ';
    else if (norm === 'ml') normalizedText = 'നമസ്കാരം';
    else if (norm === 'mr') normalizedText = 'नमस्कार';
    else if (norm === 'bn') normalizedText = 'নমস্কার';
    else if (norm === 'gu') normalizedText = 'નમસ્તે';
    else if (norm === 'pa') normalizedText = 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ';
    else if (norm === 'or') normalizedText = 'ନମସ୍କାର';
    else if (norm === 'ur') normalizedText = 'آداب';

    return {
      intent: 'greeting',
      normalizedText,
      englishMeaning: 'Greetings'
    };
  }

  return {
    intent: 'general_query',
    normalizedText: trimmed,
    englishMeaning: trimmed
  };
};

