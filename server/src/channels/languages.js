/**
 * Multilingual and Regional Dialect Registry for PM AJAY AI Voice Assistant
 * Supports Telugu, Hindi, English fully, plus Tamil, Kannada, Marathi, Bengali, Odia.
 * Includes regional dialect hints and fallback spoken prompts.
 */

export const SUPPORTED_LANGUAGES = {
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
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
    dialects: [{ id: 'standard', name: 'Standard Tamil', hint: 'Everyday colloquial Tamil' }],
    defaultDialect: 'standard'
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    dialects: [{ id: 'standard', name: 'Standard Kannada', hint: 'Everyday colloquial Kannada' }],
    defaultDialect: 'standard'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    dialects: [{ id: 'standard', name: 'Standard Marathi', hint: 'Everyday colloquial Marathi' }],
    defaultDialect: 'standard'
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    dialects: [{ id: 'standard', name: 'Standard Bengali', hint: 'Everyday colloquial Bengali' }],
    defaultDialect: 'standard'
  },
  or: {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'or-IN',
    dialects: [{ id: 'standard', name: 'Standard Odia', hint: 'Everyday colloquial Odia' }],
    defaultDialect: 'standard'
  }
};

/**
 * Stage Prompts in Telugu, Hindi, and English
 * Used as fallback strings when generative LLM is offline or undergoing high latency.
 */
export const STAGE_PROMPTS = {
  greeting_consent: {
    te: 'నమస్కారం. PM AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ నైపుణ్యాలను తెలుసుకుని మంచి ఉపాధి లేదా స్వయం ఉపాధి పథకాలను సిఫార్సు చేయడానికి మేము మీ వివరాలు నమోదు చేయవచ్చా? సరే అయితే అవును అని చెప్పండి.',
    hi: 'नमस्ते. PM AJAY आजीविका सहायक में आपका स्वागत है. आपके हुनर और अनुभव के आधार पर सही ट्रेनिंग और सरकारी योजना खोजने के लिए क्या हम बात शुरू कर सकते हैं? आगे बढ़ने के लिए हाँ कहें.',
    en: 'Namaste. Welcome to the PM AJAY Livelihood Assistant. May we record your details to recommend NSQF training and government livelihood pathways? Please say yes to proceed.'
  },
  family_occupation: {
    te: 'చాలా సంతోషం. మీ ఇంట్లో లేదా కుటుంబంలో సాంప్రదాయకంగా ఎలాంటి పనులు చేస్తుంటారు? ఉదాహరణకు చేనేత, వ్యవసాయం, పశుపోషణ లేదా ఇతర చేతివృత్తులు.',
    hi: 'बहुत बढ़िया. आपके परिवार में पारंपरिक रूप से किस तरह का काम होता रहा है? जैसे खेती, बुनाई, पशुपालन या कोई हस्तशिल्प.',
    en: 'Thank you. What kind of traditional work or trade does your family or household engage in? For example weaving, agriculture, livestock, or craft.'
  },
  current_livelihood: {
    te: 'మీరు ప్రస్తుతం రోజూ ఎలాంటి పనులు చేస్తున్నారు? ఏదైనా చిన్న వ్యాపారం, రోజువారీ కూలీ లేదా ఇతర పనులా?',
    hi: 'आप अभी अपनी आजीविका के लिए क्या काम करते हैं? कोई छोटी दुकान, दिहाड़ी काम या खेती?',
    en: 'What kind of work or daily livelihood activity are you currently engaged in? Any small business, daily wage, or trade?'
  },
  education: {
    te: 'మీరు పాఠశాల లేదా కళాశాలలో ఎంతవరకు చదువుకున్నారు? చదువు లేకపోయినా పర్వాలేదు, ధైర్యంగా చెప్పండి.',
    hi: 'आपने कहाँ तक पढ़ाई की है? यदि स्कूल नहीं गए तो भी कोई बात नहीं, बेझिझक बताएं.',
    en: 'What is your formal schooling or literacy level? It is completely fine if you have not attended formal school.'
  },
  skills: {
    te: 'మీకు ఏయే పనులలో అనుభవం లేదా ప్రావీణ్యం ఉంది? ఉదాహరణకు కుట్టుపని, మోటార్ రిపేర్, వైరింగ్, డెయిరీ లేదా అమ్మకాలు.',
    hi: 'आपको किन कामों का व्यावहारिक अनुभव या हुनर है? जैसे सिलाई, बिजली काम, मोबाइल रिपेयर, डेयरी या दुकान संभालना.',
    en: 'What practical skills or work experience do you have? For example tailoring, electrical wiring, phone repair, dairy farming, or sales.'
  },
  interests: {
    te: 'మీరు కొత్తగా ఏ రంగంలో నైపుణ్యం నేర్చుకోవడానికి ఆసక్తి కలిగి ఉన్నారు?',
    hi: 'आप भविष्य में कौन सा नया काम या हुनर सीखने में सबसे ज्यादा रुचि रखते हैं?',
    en: 'What new trade or craft are you most interested in learning?'
  },
  mobility_constraints: {
    te: 'పని కోసం లేదా ట్రైనింగ్ కోసం మీరు ఊరు దాటి ప్రయాణించగలరా, లేక ఇంటి వద్ద మాత్రమే చేయగలరా?',
    hi: 'काम या ट्रेनिंग के लिए क्या आप गाँव या कस्बे से बाहर जा सकते हैं, या घर के आसपास ही काम करना चाहते हैं?',
    en: 'Can you travel outside your village or block for training and work, or do you prefer home based activities?'
  },
  employment_preference: {
    te: 'మీకు సొంతంగా చిన్న వ్యాపారం లేదా షాప్ పెట్టుకోవాలని ఉందా, లేక నెల జీతం వచ్చే ఉద్యోగం చేయాలని ఉందా?',
    hi: 'क्या आप खुद का छोटा कारोबार शुरू करना चाहते हैं, या किसी कंपनी या वर्कशॉप में नौकरी करना पसंद करेंगे?',
    en: 'Would you prefer to start your own micro business, or would you like regular wage employment with an enterprise?'
  },
  location: {
    te: 'మీ జిల్లా మరియు మండలం లేదా గ్రామం పేరు చెప్పండి.',
    hi: 'कृपया अपने जिले और ब्लॉक या गाँव का नाम बताएं.',
    en: 'Please share your district and block or village name.'
  },
  income_goal: {
    te: 'ప్రతినెలా గౌరవప్రదమైన జీవనం కోసం మీరు ఎంత ఆదాయం సంపాదించాలని లక్ష్యంగా పెట్టుకున్నారు?',
    hi: 'हर महीने परिवार के लिए आप कितनी आमदनी कमाने का लक्ष्य रखते हैं?',
    en: 'What is your target monthly income goal to support yourself and your family comfortably?'
  },
  confirmation: {
    te: 'మీరు అందించిన సమాచారం విన్నాను. ఇవన్నీ సరైనవే అయితే అవును అని నిర్ధారించండి. మేం తగిన కోర్సులు మరియు పథకాలను సూచిస్తాం.',
    hi: 'मैंने आपके द्वारा दी गई पूरी जानकारी समझ ली है. यदि सब ठीक है तो कृपया पुष्टि करें ताकि हम उपयुक्त योजनाएं दिखा सकें.',
    en: 'I have noted your complete profile. Please confirm if everything sounds accurate so we can present your tailored opportunities.'
  }
};
