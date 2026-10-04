import { GoogleGenerativeAI } from '@google/generative-ai';
import { SarvamAIClient } from 'sarvamai';
import { Skill } from '../models/Skill.js';
import { skillsData } from '../seed/skillsData.js';

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
  conversationHistory = []
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

  const prompt = `
You are an empathetic, supportive multilingual livelihood assistant for rural and low literacy youth and women under India's PM-AJAY welfare and skilling initiative.
The user's detected speech language is ${langConfig.name} (${langConfig.nativeName}, speech code: ${langConfig.speechCode}).

Current Beneficiary Profile Context:
- Name: ${userContext.name || 'Friend'}
- District: ${userContext.district || 'Warangal, Telangana'}
- Existing Skills: ${(userContext.skills || []).join(', ') || 'None recorded yet'}
- Employment Preference: ${userContext.employmentPreference || 'Open'}
- Education Level: ${userContext.education || 'Not specified'}

User input: "${userMessage}"
${utteranceAnalysis.englishMeaning ? `Semantic Meaning / Interpretation: "${utteranceAnalysis.englishMeaning}"` : ''}

CRITICAL RELEVANCE RULES:
1. Understand the user's message semantically, including Romanized/transliterated Indian-language speech (e.g., "ela unnavu" in Telugu means "How are you?", "mujhe training chahiye" in Hindi means "I want training", "eppadi irukkeenga" in Tamil means "How are you?").
2. Respond directly to the user's ACTUAL question or intent.
3. Do not invent a different question.
4. Do not change the topic.
5. Do not randomly introduce jobs, schemes, farming, training, or other topics unless the user specifically asks about them.
6. If the user asks a simple greeting or conversational question like "How are you?" ("Ela unnavu?", "Aap kaise ho?", "Eppadi irukkeenga?", "How are you?"), respond warmly that you are doing well and ask how you can help them today. Do NOT give a generic PM-AJAY registration or scheme explanation.
7. Respond in a warm, simple tone STRICTLY in ${langConfig.name} (${langConfig.nativeName}) in its native script:
   - If detected language is Telugu (te-IN), respond naturally in Telugu (తెలుగు).
   - If detected language is Hindi (hi-IN), respond naturally in Hindi (हिन्दी).
   - If detected language is Tamil (ta-IN), respond naturally in Tamil (தமிழ்).
   - If detected language is English (en-IN), respond naturally in English.
8. NEVER ask for or mention caste or sensitive personal attributes.
9. Extract valid skills only if explicitly mentioned by user from this canonical list:
[${Array.from(validSkillKeys).join(', ')}]

You MUST return your output strictly in this JSON format with no additional text:
{
  "replyText": "Warm spoken reply text in ${langConfig.name} native script answering the user's ACTUAL question",
  "extractedSkills": ["skill_key_1"],
  "identifiedPreference": "self" | "wage" | "either" | null,
  "followUpQuestion": "A short guiding question in ${langConfig.name} if relevant"
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
        // Sanitize and whitelist skill keys
        const filteredSkills = (parsed.extractedSkills || []).filter((sk) => validSkillKeys.has(sk.toLowerCase()));
        console.log('Final assistant language:', langConfig.speechCode);
        console.log('TTS language:', langConfig.speechCode);
        return {
          replyText: parsed.replyText,
          extractedSkills: filteredSkills,
          identifiedPreference: ['self', 'wage', 'either'].includes(parsed.identifiedPreference) ? parsed.identifiedPreference : null,
          followUpQuestion: parsed.followUpQuestion || null
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
            content: `You are an empathetic Indian livelihood skilling counselor. Output strictly valid JSON with replyText in ${langConfig.name} answering the user's actual question.`
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
        const filteredSkills = (parsed.extractedSkills || []).filter((sk) => validSkillKeys.has(sk.toLowerCase()));
        console.log('Final assistant language:', langConfig.speechCode);
        console.log('TTS language:', langConfig.speechCode);
        return {
          replyText: parsed.replyText,
          extractedSkills: filteredSkills,
          identifiedPreference: ['self', 'wage', 'either'].includes(parsed.identifiedPreference) ? parsed.identifiedPreference : null,
          followUpQuestion: parsed.followUpQuestion || null
        };
      }
    }
  } catch (sarvamError) {
    // Fallback rule-based response
  }

  // Graceful rule-based empathetic response directly matching the user's actual intent
  let fallbackReply = '';
  let followUp = null;

  if (utteranceAnalysis.intent === 'greeting_how_are_you') {
    switch (langConfig.code) {
      case 'te':
        fallbackReply = 'నేను బాగున్నాను! మీకు ఈరోజు నేను ఎలా సహాయపడగలను?';
        break;
      case 'hi':
        fallbackReply = 'मैं बिल्कुल ठीक हूँ! आज मैं आपकी क्या सहायता कर सकता हूँ?';
        break;
      case 'ta':
        fallbackReply = 'நான் நலமாக இருக்கிறேன்! இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?';
        break;
      case 'kn':
        fallbackReply = 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?';
        break;
      case 'ml':
        fallbackReply = 'എനിക്ക് സുഖമാണ്! ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?';
        break;
      case 'mr':
        fallbackReply = 'मी मजेत आहे! आज मी तुम्हाला कशी मदत करू शकतो?';
        break;
      case 'bn':
        fallbackReply = 'আমি ভালো আছি! আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?';
        break;
      case 'gu':
        fallbackReply = 'હું મજામાં છું! આજે હું તમને કેવી રીતે મદદ કરી શકું?';
        break;
      case 'pa':
        fallbackReply = 'ਮੈਂ ਬਿਲਕੁਲ ਠੀਕ ਹਾਂ! ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?';
        break;
      case 'or':
        fallbackReply = 'ମୁଁ ଭଲ ଅଛି! ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?';
        break;
      case 'ur':
        fallbackReply = 'میں بالکل ٹھیک ہوں! آج میں آپ کی کیا مدد کر سکتا ہوں؟';
        break;
      default:
        fallbackReply = 'I am doing well! How can I help you today?';
        break;
    }
  } else if (utteranceAnalysis.intent === 'request_training') {
    switch (langConfig.code) {
      case 'te':
        fallbackReply = 'తప్పకుండా! మీకు టైలరింగ్, సోలార్ టెక్నీషియన్, డెయిరీ ఫార్మింగ్ వంటి ఉచిత నైపుణ్య శిక్షణలు అందుబాటులో ఉన్నాయి. మీరు ఏ రంగంలో శిక్షణ పొందాలనుకుంటున్నారు?';
        followUp = 'మీరు స్వయం ఉపాధి కోసం నేర్చుకోవాలనుకుంటున్నారా లేదా నెల జీతం ఉద్యోగం కోసమా?';
        break;
      case 'hi':
        fallbackReply = 'ज़रूर! हमारे पास सिलाई, सोलर इंस्टॉलेशन और डेयरी जैसे कई मुफ्त प्रशिक्षण कार्यक्रम उपलब्ध हैं। आप किस काम में ट्रेनिंग लेना चाहते हैं?';
        followUp = 'क्या आप खुद का काम शुरू करना चाहते हैं या नौकरी करना पसंद करेंगे?';
        break;
      case 'ta':
        fallbackReply = 'நிச்சயமாக! தையல், சோலார் மற்றும் பால் பண்ணை போன்ற இலவச பயிற்சிகள் உள்ளன. நீங்கள் எந்த துறையில் பயிற்சி பெற விரும்புகிறீர்கள்?';
        break;
      case 'kn':
        fallbackReply = 'ಖಂಡಿತ! ಟೈಲರಿಂಗ್, ಸೋಲಾರ್ ಮತ್ತು ಡೈರಿ ಫಾರ್ಮಿಂಗ್ ಮುಂತಾದ ಉಚಿತ ಕೌಶಲ್ಯ ತರಬೇತಿಗಳು ಲಭ್ಯವಿವೆ. ನೀವು ಯಾವ ಕ್ಷೇತ್ರದಲ್ಲಿ ತರಬೇತಿ ಪಡೆಯಲು ಬಯಸುತ್ತೀರಿ?';
        break;
      case 'ml':
        fallbackReply = 'തീർച്ചയായും! തയ്യൽ, സോളാർ, ഡയറി ഫാമിംഗ് തുടങ്ങിയ സൗജന്യ പരിശീലനങ്ങൾ ലഭ്യമാണ്. നിങ്ങൾക്ക് ഏത് മേഖലയിലാണ് പരിശീലനം വേണ്ടത്?';
        break;
      case 'mr':
        fallbackReply = 'नक्कीच! टेलरिंग, सोलर तंत्रज्ञ आणि दुग्धव्यवसाय यासारखी मोफत कौशल्य प्रशिक्षणे उपलब्ध आहेत. तुम्हाला कोणत्या क्षेत्रात प्रशिक्षण घ्यायचे आहे?';
        break;
      case 'bn':
        fallbackReply = 'অবশ্যই! আমাদের কাছে সেলাই, সোলার টেকনিশিয়ান এবং ডেইরি ফার্মিংয়ের মতো বিনামূল্যে প্রশিক্ষণ রয়েছে। আপনি কোন ক্ষেত্রে প্রশিক্ষণ নিতে চান?';
        break;
      case 'gu':
        fallbackReply = 'ચોક્કસ! સિલાઈ, સોલાર ટેકનિશિયન અને ડેરી ફાર્મિંગ જેવી મફત તાલીમો ઉપલબ્ધ છે. તમે કયા ક્ષેત્રમાં તાલીમ મેળવવા માંગો છો?';
        break;
      case 'pa':
        fallbackReply = 'ਜ਼ਰੂਰ! ਟੇਲਰਿੰਗ, ਸੋਲਰ ਟੈਕਨੀਸ਼ੀਅਨ ਅਤੇ ਡੇਅਰੀ ਵਰਗੀਆਂ ਮੁਫ਼ਤ ਸਿਖਲਾਈਆਂ ਉਪਲਬਧ ਹਨ। ਤੁਸੀਂ ਕਿਸ ਖੇਤਰ ਵਿੱਚ ਸਿਖਲਾਈ ਲੈਣਾ ਚਾਹੁੰਦੇ ਹੋ?';
        break;
      case 'or':
        fallbackReply = 'ନିଶ୍ଚିତ ଭାବରେ! ଟେଲରିଂ, ସୌର ଟେକ୍ନିସିଆନ୍ ଏବଂ ଡାଏରୀ ଫାର୍ମିଂ ଭଳି ମାଗଣା ପ୍ରଶିକ୍ଷଣ ଉପଲବ୍ଧ। ଆପଣ କେଉଁ କ୍ଷେତ୍ରରେ ପ୍ରଶିକ୍ଷଣ ନେବାକୁ ଚାହାଁନ୍ତି?';
        break;
      case 'ur':
        fallbackReply = 'ضرور! سلائی، سولر ٹیکنیشن اور ڈیری فارمنگ جیسی مفت تربیت دستیاب ہے۔ آپ کس شعبے میں تربیت حاصل کرنا چاہتے ہیں؟';
        break;
      default:
        fallbackReply = 'Certainly! We offer free training in tailoring, solar technician, dairy farming, and more. Which trade or skill would you like to learn?';
        break;
    }
  } else if (utteranceAnalysis.intent === 'request_job') {
    switch (langConfig.code) {
      case 'te':
        fallbackReply = 'తప్పకుండా! మీ అర్హతలు మరియు నైపుణ్యాల ఆధారంగా ఉపాధి అవకాశాలు ఉన్నాయి. మీ విద్యార్హత మరియు మీరు ఏ రకమైన ఉద్యోగం కోసం చూస్తున్నారో చెప్పండి.';
        break;
      case 'hi':
        fallbackReply = 'ज़रूर! आपके हुनर और अनुभव के आधार पर कई रोजगार के अवसर हैं। कृपया अपनी योग्यता और पसंदीदा काम बताएं।';
        break;
      case 'ta':
        fallbackReply = 'நிச்சயமாக! உங்கள் தகுதிக்கு ஏற்ப வேலைவாய்ப்புகள் உள்ளன. உங்கள் கல்வித்தகுதி மற்றும் நீங்கள் விரும்பும் வேலை பற்றி கூறுங்கள்.';
        break;
      case 'kn':
        fallbackReply = 'ಖಂಡಿತ! ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳಿಗೆ ತಕ್ಕ ಉದ್ಯೋಗಾವಕಾಶಗಳಿವೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿದ್ಯಾರ್ಹತೆ ಮತ್ತು ನೀವು ಬಯಸುವ ಕೆಲಸದ ಬಗ್ಗೆ ತಿಳಿಸಿ.';
        break;
      case 'ml':
        fallbackReply = 'തീർച്ചയായും! നിങ്ങളുടെ യോഗ്യതയ്ക്ക് അനുയോജ്യമായ തൊഴിലവസരങ്ങൾ ലഭ്യമാണ്. നിങ്ങളുടെ വിദ്യാഭ്യാസവും താല്പര്യമുള്ള ജോലിയും വ്യക്തമാക്കുക.';
        break;
      case 'mr':
        fallbackReply = 'नक्कीच! तुमच्या पात्रतेनुसार आणि कौशल्यानुसार रोजगाराच्या चांगल्या संधी आहेत. कृपया तुमचे शिक्षण व पसंतीचे काम सांगा.';
        break;
      case 'bn':
        fallbackReply = 'অবশ্যই! আপনার যোগ্যতা ও দক্ষতার ভিত্তিতে কর্মসংস্থানের সুযোগ রয়েছে। অনুগ্রহ করে আপনার শিক্ষাগত যোগ্যতা ও পছন্দের কাজ জানান।';
        break;
      case 'gu':
        fallbackReply = 'ચોક્કસ! આપની યોગ્યતા અને કુશળતા અનુસાર રોજગારીની તકો છે. કૃપા કરીને તમારો અભ્યાસ અને પસંદગીનું કામ જણાવો.';
        break;
      case 'pa':
        fallbackReply = "ਜ਼ਰੂਰ! ਤੁਹਾਡੀ ਯੋਗਤਾ ਅਤੇ ਹੁਨਰ ਦੇ ਆਧਾਰ 'ਤੇ ਰੋਜ਼ਗਾਰ ਦੇ ਮੌਕੇ ਉਪਲਬਧ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਪੜ੍ਹਾਈ ਅਤੇ ਪਸੰਦੀਦਾ ਕੰਮ ਦੱਸੋ।";
        break;
      case 'or':
        fallbackReply = 'ନିଶ୍ଚିତ ଭାବରେ! ଆପଣଙ୍କ ଯୋଗ୍ୟତା ଏବଂ ଦକ୍ଷତା ଅନୁଯାୟୀ ରୋଜଗାରର ସୁଯୋଗ ରହିଛି। ଦୟାକରି ଆପଣଙ୍କ ଶିକ୍ଷା ଏବଂ ପସନ୍ଦର କାମ କୁହନ୍ତୁ।';
        break;
      case 'ur':
        fallbackReply = 'ضرور! آپ کی قابلیت اور مہارت کی بنیاد پر روزگار کے مواقع دستیاب ہیں۔ براہ کرم اپنی تعلیم اور پسندیدہ کام بتائیں۔';
        break;
      default:
        fallbackReply = 'Certainly! We have various employment opportunities based on your skills. Please share your education and the type of role you are looking for.';
        break;
    }
  } else if (utteranceAnalysis.intent === 'greeting') {
    switch (langConfig.code) {
      case 'te':
        fallbackReply = 'నమస్కారం! PM-AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. ఈరోజు మీకు నేను ఎలా సహాయపడగలను?';
        break;
      case 'hi':
        fallbackReply = 'नमस्ते! PM-AJAY आजीविका सहायक में आपका स्वागत है। आज मैं आपकी क्या मदद कर सकता हूँ?';
        break;
      case 'ta':
        fallbackReply = 'வணக்கம்! PM-AJAY வாழ்வாதார உதவியாளருக்கு வரவேற்கிறோம். இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?';
        break;
      case 'kn':
        fallbackReply = 'ನಮಸ್ಕಾರ! PM-AJAY ಜೀವನಾಧಾರ ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?';
        break;
      case 'ml':
        fallbackReply = 'നമസ്കാരം! PM-AJAY ജീവനോപാധി അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?';
        break;
      case 'mr':
        fallbackReply = 'नमस्कार! PM-AJAY उपजीविका सहाय्यकामध्ये आपले स्वागत आहे. आज मी आपली काय मदत करू शकतो?';
        break;
      case 'bn':
        fallbackReply = 'নমস্কার! PM-AJAY জীবিকা সহায়ক পোর্টালে স্বাগতম। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?';
        break;
      case 'gu':
        fallbackReply = 'નમસ્તે! PM-AJAY આજીવિકા સહાયકમાં આપનું સ્વાગત છે. આજે હું તમને કેવી રીતે મદદ કરી શકું?';
        break;
      case 'pa':
        fallbackReply = 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! PM-AJAY ਰੋਜ਼ਗਾਰ ਸਹਾਇਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?';
        break;
      case 'or':
        fallbackReply = 'ନମସ୍କାର! PM-AJAY ଜୀବିକା ସହାୟକକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?';
        break;
      case 'ur':
        fallbackReply = 'آداب! PM-AJAY روزگار اسسٹنٹ میں آپ کا خیر مقدم ہے۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟';
        break;
      default:
        fallbackReply = 'Hello! Welcome to the PM-AJAY Livelihood Assistant. How can I help you today?';
        break;
    }
  } else {
    // Contextual direct response
    switch (langConfig.code) {
      case 'te':
        fallbackReply = 'మీరు చెప్పిన వివరాలను నమోదు చేసుకున్నాను. మీ నైపుణ్యాలకు తగిన ఉచిత శిక్షణ మరియు ప్రభుత్వ పథకాల సమాచారాన్ని అందించడానికి నేను సిద్ధంగా ఉన్నాను.';
        break;
      case 'hi':
        fallbackReply = 'मैंने आपकी बात समझ ली है। आपके कौशल के अनुसार सही ट्रेनिंग और योजनाओं की जानकारी देने के लिए मैं उपलब्ध हूँ।';
        break;
      case 'ta':
        fallbackReply = 'உங்கள் விவரங்களை நான் புரிந்து கொண்டேன். உங்களுக்கு ஏற்ற பயிற்சி மற்றும் அரசு திட்டங்கள் பற்றிய தகவல்களை வழங்க நான் தயாராக உள்ளேன்.';
        break;
      case 'kn':
        fallbackReply = 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ. ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳಿಗೆ ಸೂಕ್ತವಾದ ಉಚಿತ ತರಬೇತಿ ಮತ್ತು ಸರಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿಯನ್ನು ನೀಡಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ.';
        break;
      case 'ml':
        fallbackReply = 'നിങ്ങളുടെ വിവരങ്ങൾ ഞാൻ മനസ്സിലാക്കി. നിങ്ങളുടെ കഴിവിന് അനുയോജ്യമായ സൗജന്യ പരിശീലനങ്ങളും സർക്കാർ പദ്ധതികളും കണ്ടെത്താൻ ഞാൻ സഹായിക്കാം.';
        break;
      case 'mr':
        fallbackReply = 'मी आपली माहिती नोंदवून घेतली आहे. आपल्या कौशल्यांनुसार योग्य मोफत प्रशिक्षण व सरकारी योजनांची माहिती देण्यासाठी मी तयार आहे.';
        break;
      case 'bn':
        fallbackReply = 'আমি আপনার বিবরণ নোট করেছি। আপনার দক্ষতার জন্য সঠিক বিনামূল্যে প্রশিক্ষণ এবং সরকারি প্রকল্পগুলি সম্পর্কে তথ্য দিতে আমি প্রস্তুত।';
        break;
      case 'gu':
        fallbackReply = 'મેં તમારી માહિતી નોંધી લીધી છે. તમારી આવડત મુજબ મફત તાલીમ અને સરકારી યોજનાઓની માહિતી આપવા હું તૈયાર છું.';
        break;
      case 'pa':
        fallbackReply = 'ਮੈਂ ਤੁਹਾਡੀ ਗੱਲ ਸਮਝ ਲਈ ਹੈ। ਤੁਹਾਡੇ ਹੁਨਰ ਮੁਤਾਬਕ ਮੁਫ਼ਤ ਸਿਖਲਾਈ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਜਾਣਕਾਰੀ ਦੇਣ ਲਈ ਮੈਂ ਤਿਆਰ ਹਾਂ।';
        break;
      case 'or':
        fallbackReply = 'ମୁଁ ଆପଣଙ୍କ କଥା ବୁଝିପାରିଲି। ଆପଣଙ୍କ ଦକ୍ଷତା ଅନୁଯାୟୀ ମାଗଣା ପ୍ରଶିକ୍ଷଣ ଏବଂ ସରକାରୀ ଯୋଜନା ବିଷୟରେ ସୂଚନା ଦେବାକୁ ମୁଁ ପ୍ରସ୍ତୁତ।';
        break;
      case 'ur':
        fallbackReply = 'میں نے آپ کی بات سمجھ لی ہے۔ آپ کی مہارت کے مطابق مفت تربیت اور سرکاری اسکیموں کی معلومات دینے کے لیے میں تیار ہوں۔';
        break;
      default:
        fallbackReply = 'I have understood your message. I am here to help you discover verified training programs and livelihood schemes.';
        break;
    }
  }

  console.log('Final assistant language:', langConfig.speechCode);
  console.log('TTS language:', langConfig.speechCode);

  return {
    replyText: fallbackReply,
    extractedSkills: [],
    identifiedPreference: null,
    followUpQuestion: followUp
  };
};
