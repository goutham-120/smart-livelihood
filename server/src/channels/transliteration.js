/**
 * Indic Script Transliteration & Native Script Normalization Engine
 * 
 * Provides:
 * 1. Automatic script detection (Devanagari, Telugu, Tamil, Bengali, Kannada, Gujarati, etc.)
 * 2. Integration with Sarvam AI Transliteration API (when SARVAM_API_KEY is configured)
 * 3. High-precision deterministic phonetic transliteration fallback for 22 Indian languages
 * 4. Preservation of English, code-mixed acronyms, numbers, and proper brand names
 * 5. Full adherence to Section 5: { rawTranscript, displayTranscript, language, script, confidence }
 */

import { normalizeLanguageCode, getLanguageConfig, SUPPORTED_LANGUAGES } from './languages.js';

// ISO 15924 Script Codes mapping
export const SCRIPT_CODES = {
  hi: 'Deva',
  mr: 'Deva',
  ne: 'Deva',
  sa: 'Deva',
  mai: 'Deva',
  kok: 'Deva',
  brx: 'Deva',
  doi: 'Deva',
  te: 'Telu',
  ta: 'Taml',
  kn: 'Knda',
  bn: 'Beng',
  as: 'Beng',
  mni: 'Beng',
  gu: 'Gujr',
  ml: 'Mlym',
  pa: 'Guru',
  od: 'Orya',
  or: 'Orya',
  ur: 'Arab',
  ks: 'Arab',
  sd: 'Arab',
  sat: 'Olck',
  en: 'Latn'
};

export const getScriptCodeForLanguage = (langCode) => {
  const norm = normalizeLanguageCode(langCode || 'en');
  return SCRIPT_CODES[norm] || 'Deva';
};

/**
 * Checks whether text contains characters from the native script of the given language.
 */
export const isTextInNativeScript = (text, langCode) => {
  if (!text || typeof text !== 'string') return false;
  const norm = normalizeLanguageCode(langCode || 'en');
  if (norm === 'en') return true;

  const config = SUPPORTED_LANGUAGES[norm];
  if (!config || !config.unicodeRange) return false;

  const matches = (text.match(new RegExp(config.unicodeRange.source, 'g')) || []).length;
  // If at least 25% of alphabetic characters belong to the native script, consider it native
  const totalLetters = (text.match(/[\p{L}]/gu) || []).length;
  if (totalLetters === 0) return true;
  return (matches / totalLetters) >= 0.25;
};

/**
 * Detects the dominant script in a given text string.
 */
export const detectScriptFromText = (text) => {
  if (!text || typeof text !== 'string') return 'Latn';
  if (/[\u0900-\u097F]/.test(text)) return 'Deva';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'Telu';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'Taml';
  if (/[\u0980-\u09FF]/.test(text)) return 'Beng';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'Knda';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'Gujr';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'Mlym';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'Guru';
  if (/[\u0B00-\u0B7F]/.test(text)) return 'Orya';
  if (/[\u0600-\u06FF]/.test(text)) return 'Arab';
  if (/[\u1C50-\u1C7F]/.test(text)) return 'Olck';
  return 'Latn';
};

// Well-known acronyms and proper names to preserve verbatim in Latin script
const PRESERVED_TOKENS = new Set([
  'PMEGP', 'PM-AJAY', 'PMAJAY', 'PMKVY', 'NSQF', 'DIC', 'KVIC', 'AMHSSC',
  'WhatsApp', 'Google', 'YouTube', 'OTP', 'SMS', 'URL', 'ID', 'PAN', 'Aadhaar',
  'MSME', 'SC', 'ST', 'OBC', 'BPL', 'EWS', 'INR', 'Rs', 'API', 'AI', 'NGO'
]);

// High-frequency vernacular vocabulary dictionaries for instant, high-accuracy transliteration
const INDIC_LEXICON = {
  hi: {
    'mujhe': 'मुझे',
    'mujhko': 'मुझको',
    'hum': 'हम',
    'humko': 'हमको',
    'main': 'मैं',
    'aap': 'आप',
    'aapko': 'आपको',
    'tum': 'तुम',
    'tumhe': 'तुम्हें',
    'teacher': 'टीचर',
    'ki': 'की',
    'ke': 'के',
    'ka': 'का',
    'ko': 'को',
    'se': 'से',
    'mein': 'में',
    'me': 'में',
    'par': 'पर',
    'naukri': 'नौकरी',
    'naukari': 'नौकरी',
    'job': 'जॉब',
    'chahiye': 'चाहिए',
    'chahie': 'चाहिए',
    'tailoring': 'टेलरिंग',
    'training': 'ट्रेनिंग',
    'shiksha': 'शिक्षा',
    'keliye': 'के लिए',
    'liye': 'लिए',
    'iske': 'इसके',
    'uske': 'उसके',
    'koi': 'कोई',
    'kuch': 'कुछ',
    'sarkari': 'सरकारी',
    'yojana': 'योजना',
    'yojanayein': 'योजनाएं',
    'hai': 'है',
    'hain': 'हैं',
    'ho': 'हो',
    'hoon': 'हूँ',
    'hun': 'हूँ',
    'tha': 'था',
    'the': 'थे',
    'thi': 'थी',
    'kya': 'क्या',
    'kaise': 'कैसे',
    'kaha': 'कहाँ',
    'kahan': 'कहाँ',
    'kab': 'कब',
    'kyon': 'क्यों',
    'kyu': 'क्यों',
    'batao': 'बताओ',
    'bataiye': 'बताइए',
    'karna': 'करना',
    'karein': 'करें',
    'karo': 'करो',
    'swarojgar': 'स्वरोजगार',
    'svarojgar': 'स्वरोजगार',
    'rozgar': 'रोजगार',
    'rojgar': 'रोजगार',
    'namaste': 'नमस्ते',
    'pranam': 'प्रणाम',
    'dhanyavad': 'धन्यवाद',
    'dhanyawad': 'धन्यवाद',
    'shukriya': 'शुक्रिया',
    'ha': 'हाँ',
    'haan': 'हाँ',
    'nahi': 'नहीं',
    'nahin': 'नहीं',
    'suno': 'सुनो',
    'bolo': 'बोलो',
    'koshish': 'कोशिश',
    'paisa': 'पैसा',
    'paise': 'पैसे',
    'loan': 'लोन',
    'subsidy': 'सब्सिडी',
    'bank': 'बैंक',
    'dharohar': 'धरोहर',
    'karz': 'कर्ज',
    'dukaan': 'दुकान',
    'vyapar': 'व्यापार',
    'dhandha': 'धंधा'
  },
  te: {
    'naaku': 'నాకు',
    'naku': 'నాకు',
    'nenu': 'నేను',
    'meeru': 'మీరు',
    'maaku': 'మాకు',
    'teacher': 'టీచర్',
    'job': 'జాబ్',
    'udyogam': 'ఉద్యోగం',
    'udhyogam': 'ఉద్యోగం',
    'pani': 'పని',
    'kavali': 'కావాలి',
    'kaavali': 'కావాలి',
    'tailoring': 'టైలరింగ్',
    'training': 'ట్రైనింగ్',
    'shikshana': 'శిక్షణ',
    'kuttupani': 'కుట్టుపని',
    'chenetha': 'చేనేత',
    'swayam': 'స్వయం',
    'upadhi': 'ఉపాధి',
    'kosam': 'కోసం',
    'prabhutva': 'ప్రభుత్వ',
    'prabhutvam': 'ప్రభుత్వం',
    'pathakam': 'పథకం',
    'pathakalu': 'పథకాలు',
    'yojana': 'యోజన',
    'yojanau': 'యోజనలు',
    'undi': 'ఉంది',
    'unnadi': 'ఉన్నది',
    'unnayi': 'ఉన్నాయి',
    'unnanu': 'ఉన్నాను',
    'unnaru': 'ఉన్నారు',
    'ela': 'ఎలా',
    'yela': 'ఎలా',
    'unnavu': 'ఉన్నావు',
    'bavunnara': 'బాగున్నారా',
    'bagunnara': 'బాగున్నారా',
    'namaskaram': 'నమస్కారం',
    'namaste': 'నమస్తే',
    'dhanyavadalu': 'ధన్యవాదాలు',
    'avunu': 'అవును',
    'ledu': 'లేదు',
    'kaadu': 'కాదు',
    'ippudu': 'ఇప్పుడు',
    'eppudu': 'ఎప్పుడు',
    'ekkada': 'ఎక్కడ',
    'enduku': 'ఎందుకు',
    'emi': 'ఏమి',
    'emiti': 'ఏమిటి',
    'cheppandi': 'చెప్పండి',
    'chudandi': 'చూడండి',
    'darakhasthu': 'దరఖాస్తు',
    'loan': 'లోన్',
    'appu': 'అప్పు',
    'subsidy': 'సబ్సిడీ',
    'bank': 'బ్యాంక్',
    'dabbulu': 'డబ్బులు',
    'vyaparam': 'వ్యాపారం',
    'angadi': 'అంగడి',
    'kottu': 'కొట్టు',
    'ke': 'కి',
    'ki': 'కి'
  },
  ta: {
    'enakku': 'எனக்கு',
    'enaku': 'எனக்கு',
    'naan': 'நான்',
    'neengal': 'நீங்கள்',
    'ungal': 'உங்கள்',
    'vela': 'வேலை',
    'velai': 'வேலை',
    'job': 'ஜாப்',
    'teacher': 'டீச்சர்',
    'venum': 'வேணும்',
    'vendum': 'வேண்டும்',
    'tailoring': 'டெய்லரிங்',
    'thaiyal': 'தையல்',
    'training': 'டிரெய்னிங்',
    'payirchi': 'பயிற்சி',
    'arasu': 'அரசு',
    'thittam': 'திட்டம்',
    'suyathozhil': 'சுயதொழில்',
    'vanakkam': 'வணக்கம்',
    'nandri': 'நன்றி',
    'aam': 'ஆம்',
    'illai': 'இல்லை',
    'eppo': 'எப்போ',
    'enga': 'எங்க',
    'yeppadi': 'எப்படி',
    'eppadi': 'எப்படி',
    'irukkeenga': 'இருக்கீங்க',
    'sollunga': 'சொல்லுங்க',
    'kadan': 'கடன்',
    'maniyam': 'மானியம்'
  },
  bn: {
    'amar': 'আমার',
    'ekta': 'একটা',
    'chakri': 'চাকরি',
    'kaj': 'কাজ',
    'chai': 'চাই',
    'dorkar': 'দরকার',
    'teacher': 'টিচার',
    'job': 'জব',
    'tailoring': 'টেলরিং',
    'training': 'ট্রেনিং',
    'proshikshon': 'প্রশিক্ষণ',
    'sorkari': 'সরকারি',
    'prokolpo': 'প্রকল্প',
    'shoniyukto': 'স্বনিযুক্তি',
    'nomoshkar': 'নমস্কার',
    'dhonnobad': 'ধন্যবাদ',
    'kemon': 'কেমন',
    'achen': 'আছেন',
    'hobe': 'হবে',
    'ache': 'আছে',
    'kothay': 'কোথায়',
    'ki': 'কি',
    'bolo': 'বলুন'
  },
  kn: {
    'nanage': 'ನನಗೆ',
    'kelasa': 'ಕೆಲಸ',
    'beku': 'ಬೇಕು',
    'teacher': 'ಟೀಚರ್',
    'job': 'ಜಾಬ್',
    'tailoring': 'ಟೈಲರಿಂಗ್',
    'training': 'ತರಬೇತಿ',
    'sarkari': 'ಸರ್ಕಾರಿ',
    'yojane': 'ಯೋಜನೆ',
    'svayam': 'ಸ್ವಯಂ',
    'udyog': 'ಉದ್ಯೋಗ',
    'namaskara': 'ನಮಸ್ಕಾರ',
    'dhanyavada': 'ಧನ್ಯವಾದ',
    'hegiddira': 'ಹೇಗಿದ್ದೀರಾ',
    'ideya': 'ಇದೆಯಾ',
    'hege': 'ಹೇಗೆ',
    'yelli': 'ಎಲ್ಲಿ',
    'heji': 'ಹೇಳಿ',
    // Common browser-STT spellings of Kannada words
    'nanagi': 'ನನಗೆ',
    'nange': 'ನಂಗೆ',
    'naanu': 'ನಾನು',
    'nanu': 'ನಾನು',
    'nimage': 'ನಿಮಗೆ',
    'nimma': 'ನಿಮ್ಮ',
    'kelsa': 'ಕೆಲಸ',
    'udyoga': 'ಉದ್ಯೋಗ',
    'shikshaka': 'ಶಿಕ್ಷಕ',
    'shikshakara': 'ಶಿಕ್ಷಕರ',
    'shikshakaru': 'ಶಿಕ್ಷಕರು',
    'tarabeti': 'ತರಬೇತಿ',
    'bekagide': 'ಬೇಕಾಗಿದೆ',
    'bekaagide': 'ಬೇಕಾಗಿದೆ',
    'bekagi': 'ಬೇಕಾಗಿ',
    'kagide': 'ಕಾಗಿದೆ',
    'beda': 'ಬೇಡ',
    'ide': 'ಇದೆ',
    'illa': 'ಇಲ್ಲ',
    'alli': 'ಅಲ್ಲಿ',
    'maadi': 'ಮಾಡಿ',
    'kodi': 'ಕೊಡಿ',
    'heli': 'ಹೇಳಿ',
    'yojanegalu': 'ಯೋಜನೆಗಳು',
    'naukri': 'ನೌಕರಿ'
  },
  gu: {
    'mane': 'મને',
    'mare': 'મારે',
    'hu': 'હું',
    'tame': 'તમે',
    'naukri': 'નોકરી',
    'kam': 'કામ',
    'joiye': 'જોઈએ',
    'chhe': 'છે',
    'teacher': 'ટીચર',
    'job': 'જોબ',
    'tailoring': 'ટેલરિંગ',
    'training': 'તાલીમ',
    'sarkari': 'સરકારી',
    'yojana': 'યોજના',
    'kem': 'કેમ',
    'chho': 'છો',
    'namaste': 'નમસ્તે',
    'aabhar': 'આભાર'
  },
  mr: {
    'mala': 'मला',
    'mi': 'मी',
    'tumhi': 'तुम्ही',
    'naukri': 'नोकरी',
    'kam': 'काम',
    'pahije': 'पाहिजे',
    'havi': 'हवी',
    'ahe': 'आहे',
    'teacher': 'टीचर',
    'job': 'जॉब',
    'tailoring': 'टेलरिंग',
    'training': 'प्रशिक्षण',
    'sarkari': 'सरकारी',
    'yojana': 'योजना',
    'kase': 'कसे',
    'ahat': 'आहात',
    'namaskar': 'नमस्कार',
    'dhanyavad': 'धन्यवाद'
  },
  ml: {
    'enikku': 'എനിക്ക്',
    'njan': 'ഞാൻ',
    'ningal': 'നിങ്ങൾ',
    'joli': 'ജോലി',
    'venam': 'വേണം',
    'teacher': 'ടീച്ചർ',
    'job': 'ജോബ്',
    'tailoring': 'ടൈലറിംഗ്',
    'training': 'പരിശീലനം',
    'sarkari': 'സർക്കാർ',
    'paddhathi': 'പദ്ധതി',
    'sukhamano': 'സുഖമാണോ',
    'namaskaram': 'നമസ്കാരം',
    'nanni': 'നന്ദി'
  },
  pa: {
    'mainu': 'ਮੈਨੂੰ',
    'menu': 'ਮੈਨੂੰ',
    'main': 'ਮੈਂ',
    'tusi': 'ਤੁਸੀਂ',
    'naukri': 'ਨੌਕਰੀ',
    'kam': 'ਕੰਮ',
    'kamm': 'ਕੰਮ',
    'chahidi': 'ਚਾਹੀਦੀ',
    'chahida': 'ਚਾਹੀਦਾ',
    'hai': 'ਹੈ',
    'teacher': 'ਟੀਚਰ',
    'job': 'ਜੌਬ',
    'tailoring': 'ਟੇਲਰਿੰਗ',
    'training': 'ਸਿਖਲਾਈ',
    'sarkari': 'ਸਰਕਾਰੀ',
    'yojana': 'ਯੋਜਨਾ',
    'sat': 'ਸਤਿ',
    'sri': 'ਸ੍ਰੀ',
    'akaal': 'ਅਕਾਲ',
    'kiddan': 'ਕਿੱਦਾਂ',
    'dhanvaad': 'ਧੰਨਵਾਦ'
  },
  or: {
    'mote': 'ମୋତେ',
    'mu': 'ମୁଁ',
    'apana': 'ଆପଣ',
    'chakiri': 'ଚାକିରି',
    'kama': 'କାମ',
    'darkar': 'ଦରਕਾਰ',
    'teacher': 'ଟିଚର',
    'job': 'ଜବ',
    'tailoring': 'ଟେଲରିଂ',
    'training': 'ପ୍ରଶିକ୍ଷଣ',
    'sarkari': 'ସରକାରୀ',
    'yojana': 'ଯୋଜନା',
    'namaskar': 'ନମସ୍କାର',
    'dhanyabad': 'ଧନ୍ୟବାଦ'
  },
  ur: {
    'mujhe': 'مجھے',
    'main': 'میں',
    'aap': 'آپ',
    'ki': 'کی',
    'ke': 'کے',
    'ka': 'کا',
    'ko': 'کو',
    'se': 'سے',
    'mein': 'میں',
    'teacher': 'ٹیچر',
    'naukri': 'نوکری',
    'mulazmat': 'ملازمت',
    'chahiye': 'چاہیے',
    'job': 'جاب',
    'tailoring': 'درزی',
    'training': 'تربیت',
    'sarkari': 'سرکاری',
    'scheme': 'اسکیم',
    'hai': 'ہے',
    'hain': 'ہیں',
    'adaab': 'آداب',
    'shukriya': 'شکریہ'
  }
};

// Sanskrit / Nepali / Maithili / Konkani share Devanagari mappings
INDIC_LEXICON.sa = { ...INDIC_LEXICON.hi, 'ichhami': 'इच्छामि', 'suchikarma': 'सूचीकर्म' };
INDIC_LEXICON.ne = { ...INDIC_LEXICON.hi, 'malai': 'मलाई', 'chahincha': 'चाहिन्छ', 'silai': 'सिलाई' };
INDIC_LEXICON.mai = { ...INDIC_LEXICON.hi, 'hamra': 'हमरा', 'chahi': 'चाही', 'silai': 'सिलाई' };
INDIC_LEXICON.kok = { ...INDIC_LEXICON.hi, 'mhaka': 'म्हाका', 'jay': 'जाय' };

/**
 * Phonetic syllabic character maps for Brahmic scripts.
 * Enables general transliteration for any unseen words.
 */
const PHONETIC_MAPS = {
  Deva: {
    vowels: {
      'aa': 'आ', 'a': 'अ', 'ee': 'ई', 'i': 'इ', 'oo': 'ऊ', 'u': 'उ',
      'ai': 'ऐ', 'e': 'ए', 'au': 'औ', 'o': 'ओ', 'am': 'अं', 'ah': 'अः'
    },
    matras: {
      'aa': 'ा', 'a': '', 'ee': 'ी', 'i': 'ि', 'oo': 'ू', 'u': 'ु',
      'ai': 'ै', 'e': 'े', 'au': 'ौ', 'o': 'ो', 'am': 'ं', 'ah': 'ः'
    },
    consonants: {
      'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ng': 'ङ',
      'ch': 'च', 'chh': 'छ', 'j': 'ज', 'jh': 'झ', 'ny': 'ञ',
      't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
      'p': 'प', 'ph': 'फ', 'f': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म',
      'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व',
      'sh': 'श', 's': 'स', 'h': 'ह', 'ksh': 'क्ष', 'tr': 'त्र', 'gy': 'ज्ञ'
    },
    virama: '्'
  },
  Telu: {
    vowels: {
      'aa': 'ఆ', 'a': 'అ', 'ee': 'ఈ', 'i': 'ఇ', 'oo': 'ఊ', 'u': 'ఉ',
      'ai': 'ఐ', 'e': 'ఎ', 'au': 'ఔ', 'o': 'ఒ', 'am': 'అం', 'ah': 'అః'
    },
    matras: {
      'aa': 'ా', 'a': '', 'ee': 'ీ', 'i': 'ి', 'oo': 'ూ', 'u': 'ు',
      'ai': 'ై', 'e': 'ె', 'au': 'ౌ', 'o': 'ొ', 'am': 'ం', 'ah': 'ః'
    },
    consonants: {
      'k': 'క', 'kh': 'ఖ', 'g': 'గ', 'gh': 'ఘ', 'ng': 'ఙ',
      'ch': 'చ', 'chh': 'ఛ', 'j': 'జ', 'jh': 'ఝ', 'ny': 'ఞ',
      't': 'త', 'th': 'థ', 'd': 'ద', 'dh': 'ధ', 'n': 'న',
      'p': 'ప', 'ph': 'ఫ', 'f': 'ఫ', 'b': 'బ', 'bh': 'భ', 'm': 'మ',
      'y': 'య', 'r': 'ర', 'l': 'ల', 'v': 'వ', 'w': 'వ',
      'sh': 'శ', 's': 'స', 'h': 'హ', 'ksh': 'క్ష', 'tr': 'త్ర'
    },
    virama: '్'
  },
  Taml: {
    vowels: {
      'aa': 'ஆ', 'a': 'அ', 'ee': 'ஈ', 'i': 'இ', 'oo': 'ஊ', 'u': 'உ',
      'ai': 'ஐ', 'e': 'எ', 'au': 'ஔ', 'o': 'ஒ', 'am': 'அம்'
    },
    matras: {
      'aa': 'ா', 'a': '', 'ee': 'ீ', 'i': 'ி', 'oo': 'ூ', 'u': 'ு',
      'ai': 'ை', 'e': 'ெ', 'au': 'ௌ', 'o': 'ொ', 'am': 'ம்'
    },
    consonants: {
      'k': 'க', 'g': 'க', 'ch': 'ச', 'j': 'ஜ', 't': 'த', 'd': 'த',
      'n': 'ந', 'p': 'ப', 'b': 'ப', 'm': 'ம', 'y': 'ய', 'r': 'ர',
      'l': 'ல', 'v': 'வ', 'w': 'வ', 'sh': 'ஷ', 's': 'ஸ', 'h': 'ஹ'
    },
    virama: '்'
  },
  Beng: {
    vowels: {
      'aa': 'আ', 'a': 'অ', 'ee': 'ঈ', 'i': 'ই', 'oo': 'ঊ', 'u': 'উ',
      'ai': 'ঐ', 'e': 'এ', 'au': 'ঔ', 'o': 'ও', 'am': 'অং'
    },
    matras: {
      'aa': 'া', 'a': '', 'ee': 'ী', 'i': 'ি', 'oo': 'ূ', 'u': 'ু',
      'ai': 'ৈ', 'e': 'ে', 'au': 'ৌ', 'o': 'ো', 'am': 'ং'
    },
    consonants: {
      'k': 'ক', 'kh': 'খ', 'g': 'গ', 'gh': 'ঘ',
      'ch': 'চ', 'chh': 'ছ', 'j': 'জ', 'jh': 'ঝ',
      't': 'ত', 'th': 'থ', 'd': 'দ', 'dh': 'ध', 'n': 'ন',
      'p': 'প', 'ph': 'ফ', 'f': 'ফ', 'b': 'ব', 'bh': 'ভ', 'm': 'ম',
      'y': 'য', 'r': 'র', 'l': 'ল', 'v': 'ভ', 'w': 'ও',
      'sh': 'শ', 's': 'স', 'h': 'হ'
    },
    virama: '্'
  },
  Knda: {
    vowels: {
      'aa': 'ಆ', 'a': 'ಅ', 'ee': 'ಈ', 'i': 'ಇ', 'oo': 'ಊ', 'u': 'ಉ',
      'ai': 'ಐ', 'e': 'ಎ', 'au': 'ಔ', 'o': 'ಒ', 'am': 'ಅಂ'
    },
    matras: {
      'aa': 'ಾ', 'a': '', 'ee': 'ೀ', 'i': 'ಿ', 'oo': 'ೂ', 'u': 'ು',
      'ai': 'ೈ', 'e': 'ೆ', 'au': 'ೌ', 'o': 'ೊ', 'am': 'ಂ'
    },
    consonants: {
      'k': 'ಕ', 'kh': 'ಖ', 'g': 'ಗ', 'gh': 'ಘ',
      'ch': 'ಚ', 'chh': 'ಛ', 'j': 'ಜ', 'jh': 'ಝ',
      't': 'ತ', 'th': 'ಥ', 'd': 'ದ', 'dh': 'ಧ', 'n': 'ನ',
      'p': 'ಪ', 'ph': 'ಫ', 'f': 'ಫ', 'b': 'ಬ', 'bh': 'ಭ', 'm': 'ಮ',
      'y': 'ಯ', 'r': 'ರ', 'l': 'ಲ', 'v': 'ವ', 'w': 'ವ',
      'sh': 'ಶ', 's': 'ಸ', 'h': 'ಹ'
    },
    virama: '್'
  },
  Gujr: {
    vowels: {
      'aa': 'આ', 'a': 'અ', 'ee': 'ઈ', 'i': 'ઇ', 'oo': 'ઊ', 'u': 'ઉ',
      'ai': 'ઐ', 'e': 'એ', 'au': 'ઔ', 'o': 'ઓ', 'am': 'અં'
    },
    matras: {
      'aa': 'ા', 'a': '', 'ee': 'ી', 'i': 'િ', 'oo': 'ૂ', 'u': 'ુ',
      'ai': 'ૈ', 'e': 'ે', 'au': 'ૌ', 'o': 'ો', 'am': 'ં'
    },
    consonants: {
      'k': 'ક', 'kh': 'ખ', 'g': 'ગ', 'gh': 'ઘ',
      'ch': 'ચ', 'chh': 'છ', 'j': 'જ', 'jh': 'ઝ',
      't': 'ત', 'th': 'થ', 'd': 'દ', 'dh': 'ધ', 'n': 'ન',
      'p': 'પ', 'ph': 'ફ', 'f': 'ફ', 'b': 'બ', 'bh': 'ભ', 'm': 'મ',
      'y': 'ય', 'r': 'ર', 'l': 'લ', 'v': 'વ', 'w': 'વ',
      'sh': 'શ', 's': 'સ', 'h': 'હ'
    },
    virama: '્'
  },
  Mlym: {
    vowels: {
      'aa': 'ആ', 'a': 'അ', 'ee': 'ഈ', 'i': 'ഇ', 'oo': 'ഊ', 'u': 'ഉ',
      'ai': 'ഐ', 'e': 'എ', 'au': 'ഔ', 'o': 'ഒ', 'am': 'അം'
    },
    matras: {
      'aa': 'ാ', 'a': '', 'ee': 'ീ', 'i': 'ി', 'oo': 'ൂ', 'u': 'ു',
      'ai': 'ൈ', 'e': 'െ', 'au': 'ൌ', 'o': 'ൊ', 'am': 'ം'
    },
    consonants: {
      'k': 'ക', 'kh': 'ഖ', 'g': 'ഗ', 'gh': 'ഘ',
      'ch': 'ച', 'chh': 'ഛ', 'j': 'ജ', 'jh': 'ഝ',
      't': 'ത', 'th': 'ഥ', 'd': 'ദ', 'dh': 'ധ', 'n': 'ന',
      'p': 'പ', 'ph': 'ഫ', 'f': 'ഫ', 'b': 'ബ', 'bh': 'ഭ', 'm': 'മ',
      'y': 'യ', 'r': 'ര', 'l': 'ല', 'v': 'വ', 'w': 'വ',
      'sh': 'ശ', 's': 'സ', 'h': 'ഹ'
    },
    virama: '്'
  },
  Guru: {
    vowels: {
      'aa': 'ਆ', 'a': 'ਅ', 'ee': 'ਈ', 'i': 'ਇ', 'oo': 'ਊ', 'u': 'ਉ',
      'ai': 'ਐ', 'e': 'ਏ', 'au': 'ਔ', 'o': 'ਓ', 'am': 'ਅੰ'
    },
    matras: {
      'aa': 'ਾ', 'a': '', 'ee': 'ੀ', 'i': 'ਿ', 'oo': 'ੂ', 'u': 'ੁ',
      'ai': 'ੈ', 'e': 'ੇ', 'au': 'ੌ', 'o': 'ੋ', 'am': 'ਂ'
    },
    consonants: {
      'k': 'ਕ', 'kh': 'ਖ', 'g': 'ਗ', 'gh': 'ਘ',
      'ch': 'ਚ', 'chh': 'ਛ', 'j': 'ਜ', 'jh': 'ਝ',
      't': 'ਤ', 'th': 'ਥ', 'd': 'ਦ', 'dh': 'ਧ', 'n': 'ਨ',
      'p': 'ਪ', 'ph': 'ਫ', 'f': 'ਫ', 'b': 'ਬ', 'bh': 'ਭ', 'm': 'ਮ',
      'y': 'ਯ', 'r': 'ਰ', 'l': 'ਲ', 'v': 'ਵ', 'w': 'ਵ',
      'sh': 'ਸ਼', 's': 'ਸ', 'h': 'ਹ'
    },
    virama: '੍'
  },
  Orya: {
    vowels: {
      'aa': 'ଆ', 'a': 'ଅ', 'ee': 'ଈ', 'i': 'ଇ', 'oo': 'ଊ', 'u': 'ଉ',
      'ai': 'ଐ', 'e': 'ଏ', 'au': 'ଔ', 'o': 'ଓ', 'am': 'ଅଂ'
    },
    matras: {
      'aa': 'ା', 'a': '', 'ee': 'ୀ', 'i': 'ି', 'oo': 'ୂ', 'u': 'ୁ',
      'ai': 'ୈ', 'e': 'େ', 'au': 'ୌ', 'o': 'ୋ', 'am': 'ଂ'
    },
    consonants: {
      'k': 'କ', 'kh': 'ଖ', 'g': 'ଗ', 'gh': 'ଘ',
      'ch': 'ଚ', 'chh': 'ଛ', 'j': 'ଜ', 'jh': 'ଝ',
      't': 'ତ', 'th': 'ଥ', 'd': 'ଦ', 'dh': 'ଧ', 'n': 'ନ',
      'p': 'ପ', 'ph': 'ଫ', 'f': 'ଫ', 'b': 'ବ', 'bh': 'ଭ', 'm': 'ମ',
      'y': 'ଯ', 'r': 'ର', 'l': 'ଲ', 'v': 'ୱ', 'w': 'ୱ',
      'sh': 'ଶ', 's': 'ସ', 'h': 'ହ'
    },
    virama: '୍'
  },
  Arab: {
    vowels: {
      'aa': 'آ', 'a': 'ا', 'ee': 'ای', 'i': 'ِ', 'oo': 'او', 'u': 'ُ',
      'ai': 'ائے', 'e': 'ے', 'au': 'اؤ', 'o': 'و'
    },
    matras: {
      'aa': 'ا', 'a': '', 'ee': 'ی', 'i': 'ِ', 'oo': 'و', 'u': 'ُ',
      'ai': 'ے', 'e': 'ے', 'au': 'و', 'o': 'و'
    },
    consonants: {
      'k': 'ک', 'kh': 'کھ', 'g': 'گ', 'gh': 'گھ',
      'ch': 'چ', 'chh': 'چھ', 'j': 'ج', 'jh': 'جھ',
      't': 'ت', 'th': 'تھ', 'd': 'د', 'dh': 'دھ', 'n': 'ن',
      'p': 'پ', 'ph': 'پھ', 'f': 'ف', 'b': 'ب', 'bh': 'بھ', 'm': 'م',
      'y': 'ی', 'r': 'ر', 'l': 'ل', 'v': 'و', 'w': 'و',
      'sh': 'ش', 's': 'س', 'h': 'ہ'
    },
    virama: ''
  }
};

/**
 * Phonetically transliterates a single Romanized word into the specified script.
 */
function transliterateWordPhonetically(word, script) {
  const map = PHONETIC_MAPS[script];
  if (!map) return word;

  const lower = word.toLowerCase();
  let result = '';
  let i = 0;
  const len = lower.length;

  // Multi-character consonant and vowel lookups
  const cKeys = Object.keys(map.consonants).sort((a, b) => b.length - a.length);
  const vKeys = Object.keys(map.vowels).sort((a, b) => b.length - a.length);

  while (i < len) {
    // 1. Try matching consonant
    let matchedConsonant = null;
    for (const c of cKeys) {
      if (lower.startsWith(c, i)) {
        matchedConsonant = c;
        break;
      }
    }

    if (matchedConsonant) {
      i += matchedConsonant.length;
      const consChar = map.consonants[matchedConsonant];

      // Check following vowel
      let matchedVowel = null;
      for (const v of vKeys) {
        if (lower.startsWith(v, i)) {
          matchedVowel = v;
          break;
        }
      }

      if (matchedVowel) {
        i += matchedVowel.length;
        const matra = map.matras[matchedVowel] || '';
        result += consChar + matra;
      } else {
        // No vowel follows: if at end of word or before another consonant
        if (i < len && /[a-z]/i.test(lower[i])) {
          result += consChar + map.virama;
        } else {
          result += consChar;
        }
      }
      continue;
    }

    // 2. Try matching independent vowel
    let matchedVowel = null;
    for (const v of vKeys) {
      if (lower.startsWith(v, i)) {
        matchedVowel = v;
        break;
      }
    }

    if (matchedVowel) {
      i += matchedVowel.length;
      result += map.vowels[matchedVowel] || '';
      continue;
    }

    // Default: copy character verbatim (e.g. punctuation, numbers)
    result += word[i];
    i++;
  }

  return result || word;
}

/**
 * Converts a Romanized/transliterated word using lexicon dictionary or phonetic rules.
 */
function convertTokenToNative(token, langCode, scriptCode) {
  // Preserve acronyms & brand names
  if (PRESERVED_TOKENS.has(token) || PRESERVED_TOKENS.has(token.toUpperCase())) {
    return token;
  }

  // Preserve pure numbers or symbols
  if (/^[0-9\W]+$/.test(token)) {
    return token;
  }

  const clean = token.toLowerCase().replace(/^[^\p{L}0-9]+|[^\p{L}0-9]+$/gu, '');
  if (!clean) return token;

  const prefix = token.match(/^[^\p{L}0-9]+/gu)?.[0] || '';
  const suffix = token.match(/[^\p{L}0-9]+$/gu)?.[0] || '';

  // 1. Direct vocabulary lexicon match
  const lexicon = INDIC_LEXICON[langCode] || INDIC_LEXICON.hi;
  if (lexicon && lexicon[clean]) {
    return prefix + lexicon[clean] + suffix;
  }

  // 2. Phonetic syllabic transliteration
  const phonetic = transliterateWordPhonetically(clean, scriptCode);
  return prefix + (phonetic || clean) + suffix;
}

/**
 * Transliterates Romanized text to the detected language's native script via Sarvam AI API.
 * Falls back to deterministic phonetic engine if Sarvam is unavailable or fails.
 */
async function callSarvamTransliterate(text, speechCode, apiKey) {
  if (!apiKey || !text) return null;

  try {
    const res = await fetch('https://api.sarvam.ai/transliterate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey
      },
      body: JSON.stringify({
        input: text,
        source_language_code: 'en-IN',
        target_language_code: speechCode
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.transliterated_text || null;
  } catch (err) {
    return null;
  }
}

/**
 * Normalizes speech transcript into the required internal format:
 * {
 *   rawTranscript: "...",
 *   displayTranscript: "...",
 *   language: "hi-IN",
 *   script: "Deva",
 *   confidence: 0.XX
 * }
 */
export async function normalizeVoiceTranscript({
  rawTranscript,
  detectedLanguage,
  confidence = 0.95,
  apiKey = process.env.SARVAM_API_KEY
}) {
  const raw = String(rawTranscript || '').trim();
  const normLang = normalizeLanguageCode(detectedLanguage || 'hi');
  const langConfig = getLanguageConfig(normLang);
  const targetScript = SCRIPT_CODES[normLang] || 'Deva';
  const speechCode = langConfig.speechCode;

  // 1. If English: preserve verbatim (Section 11)
  if (normLang === 'en') {
    return {
      rawTranscript: raw,
      displayTranscript: raw,
      language: 'en-IN',
      script: 'Latn',
      confidence
    };
  }

  // 2. If STT already returned native script: DO NOT transliterate again (Section 13)
  if (isTextInNativeScript(raw, normLang)) {
    return {
      rawTranscript: raw,
      displayTranscript: raw,
      language: speechCode,
      script: targetScript,
      confidence
    };
  }

  // 3. STT returned Romanized text (script = Latn) -> Convert to native script (Section 14 & 16)
  let displayTranscript = null;

  // Try Sarvam Transliterate API first if key configured
  if (apiKey && langConfig.providerSupport?.sarvamTts) {
    try {
      displayTranscript = await callSarvamTransliterate(raw, speechCode, apiKey);
    } catch (e) {}
  }

  // Fallback to high-precision deterministic Indic engine
  if (!displayTranscript) {
    const tokens = raw.split(/(\s+)/);
    const convertedTokens = tokens.map((part) => {
      if (/^\s+$/.test(part)) return part;
      return convertTokenToNative(part, normLang, targetScript);
    });

    displayTranscript = convertedTokens.join('');

    // Ensure Devanagari declarative statements end with purna viram (danda)
    if (targetScript === 'Deva') {
      if (displayTranscript.endsWith('.')) {
        displayTranscript = displayTranscript.slice(0, -1) + '।';
      } else if (!/[?!।|,;:]$/.test(displayTranscript)) {
        displayTranscript = displayTranscript + '।';
      }
    }
  }

  return {
    rawTranscript: raw,
    displayTranscript: displayTranscript.trim(),
    language: speechCode,
    script: targetScript,
    confidence
  };
}
