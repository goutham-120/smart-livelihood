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

RECENT CONVERSATION HISTORY:
${userContext.historyContext || 'None (New Conversation)'}

CURRENT USER MESSAGE: "${userMessage}"
${utteranceAnalysis.englishMeaning ? `Semantic Meaning / Interpretation: "${utteranceAnalysis.englishMeaning}"` : ''}

CRITICAL CONTEXTUAL CONVERSATION RULES:
1. Understand the user's message semantically IN CONTEXT OF THE RECENT CONVERSATION HISTORY above.
2. Resolve short follow-up responses, pronouns, affirmations, and short queries ("yes", "no", "okay", "tell me more", "explain", "how?", "where?", "what training?", "why?", "continue") using the RECENT CONVERSATION HISTORY. If the previous assistant turn asked a question or proposed an option, interpret "yes"/"no"/"okay" as responding directly to that question.
3. Maintain topic continuity. Continue the ongoing conversation topic smoothly without changing subject unless the user explicitly introduces a new topic.
4. DO NOT restart with a generic initial greeting or welcome introduction during an ongoing conversation (where RECENT CONVERSATION HISTORY is present).
5. Respond directly to the user's ACTUAL question or intent.
6. Do not invent a different question.
7. Do not randomly introduce jobs, schemes, farming, training, or other topics unless relevant to the user's ongoing conversation context.
8. If the conversation history is empty and the user sends a standalone initial greeting (e.g. "Hello", "How are you?"), respond with a warm greeting.
9. Respond in a warm, simple tone STRICTLY in ${langConfig.name} (${langConfig.nativeName}) in its native script:
   - If detected language is Telugu (te-IN), respond naturally in Telugu (తెలుగు).
   - If detected language is Hindi (hi-IN), respond naturally in Hindi (हिन्दी).
   - If detected language is Tamil (ta-IN), respond naturally in Tamil (தமிழ்).
   - If detected language is English (en-IN), respond naturally in English.
10. NEVER ask for or mention caste or sensitive personal attributes.
11. Extract valid skills only if explicitly mentioned by user from this canonical list:
[${Array.from(validSkillKeys).join(', ')}]

You MUST return your output strictly in this JSON format with no additional text:
{
  "replyText": "Warm spoken reply text in ${langConfig.name} native script answering the user's ACTUAL question in context",
  "extractedSkills": ["skill_key_1"],
  "identifiedPreference": "self" | "wage" | "either" | null,
  "familyOccupation": "e.g. Agriculture / Weaving / Carpentry / Business / Daily wage or null",
  "currentLivelihood": "e.g. Farm machinery repair / Tailoring / Electrical work / Daily labour or null",
  "education": "Secondary (10th)" | "Higher Secondary (12th)" | "Middle (8th)" | "Primary (5th)" | "Diploma / ITI" | "Graduate" | "Below Primary" | null,
  "experienceYears": 3,
  "incomeGoal": 18000,
  "mobilityConstraints": ["Within Village Only" | "Within Block" | "Within District"] | null,
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

  const hasHistory = Boolean(userContext.historyContext && userContext.historyContext.trim().length > 0);
  const isShortFollowUp = /^(yes|no|okay|ok|haan|ha|avunu|sare|sure|tell me more|explain|how|why|where|when|continue|more)$/i.test((userMessage || '').trim());

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
        fallbackReply = 'ಖಂಡಿತ! ನಮ್ಮ ಸಂಭಾಷಣೆಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ವಿಷಯವನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ.';
        break;
      default:
        fallbackReply = 'Certainly! Continuing our conversation, I understand your response. Please let me know what specific guidance or next steps you would like to explore.';
        break;
    }
  } else if (utteranceAnalysis.intent === 'greeting_how_are_you') {
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
      default:
        fallbackReply = 'I have understood your message. I am here to help you discover verified training programs and livelihood schemes.';
        break;
    }
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
    followUpQuestion: followUp || 'Would you prefer to start your own micro business or take up a wage employment job?'
  };
};
