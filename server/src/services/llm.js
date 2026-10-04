/**
 * LLM Extraction and Empathetic Dialogue Service
 * Powered by Google Gemini with Sarvam Indic fallback and rule based recovery.
 * Strictly whitelists skill keys and enforces schema validation.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { SarvamAIClient } from 'sarvamai';
import { Skill } from '../models/Skill.js';
import { extractSkillsFromText, extractProfileAttributes, detectUserIntent } from './extract.js';
import { STAGE_PROMPTS, SUPPORTED_LANGUAGES, normalizeIndicUtterance } from '../channels/languages.js';

let geminiClient = null;
let sarvamClient = null;

const getGeminiModel = () => {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  });
};

const getSarvamClient = () => {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) return null;
  if (!sarvamClient) {
    sarvamClient = new SarvamAIClient({ apiKey });
  }
  return sarvamClient;
};

/**
 * Safely parse JSON from raw LLM output, removing any enclosing markdown blocks.
 */
const parseCleanJson = (rawText) => {
  if (!rawText) return null;
  try {
    const cleaned = String(rawText)
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
};

/**
 * Process beneficiary dialogue turn with Gemini LLM.
 * Extracts profile fields and skills, and composes an empathetic spoken reply.
 *
 * @param {object} params
 * @param {string} params.userMessage
 * @param {string} params.stage
 * @param {string} params.language
 * @param {string} params.dialect
 * @param {object} params.userContext
 * @returns {Promise<object>} Structured dialogue response
 */
export const processDialogueWithLLM = async ({
  userMessage,
  stage = 'greeting_consent',
  language = 'en',
  dialect = '',
  userContext = {}
}) => {
  // 1. Fetch valid canonical skill keys for strict whitelisting
  const allSkills = await Skill.find().select('key name names aliases sector');
  const validSkillMap = new Map();
  allSkills.forEach((s) => validSkillMap.set(s.key.toLowerCase(), s.key));

  const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;
  const dialectInfo = (langConfig.dialects || []).find((d) => d.id === dialect || d.name.toLowerCase() === String(dialect).toLowerCase());
  const dialectHint = dialectInfo ? dialectInfo.hint : 'standard conversational regional terms';
  const utteranceAnalysis = normalizeIndicUtterance(userMessage, langConfig.code);

  // 2. Prepare structured system prompt for Gemini
  const prompt = `
You are an empathetic, encouraging livelihood voice counselor for rural and low literacy youth and women under India's PM AJAY welfare initiative.
Target Language: ${langConfig.name} (${langConfig.nativeName}, speech code: ${langConfig.speechCode})
Regional Dialect Context: ${dialectInfo ? dialectInfo.name : 'Regional'} (${dialectHint})
Current Conversation Stage: ${stage}

Beneficiary Context:
Name: ${userContext.name || 'Friend'}
District: ${userContext.district || 'Warangal'}
Family Background: ${userContext.familyOccupation || 'Not specified'}
Current Work: ${userContext.currentLivelihood || 'Not specified'}
Known Skills: ${(userContext.skills || []).join(', ') || 'None yet'}
Preference: ${userContext.employmentPreference || 'Open'}

User Just Said: "${userMessage}"
${utteranceAnalysis.englishMeaning ? `Semantic Understanding / Interpretation: "${utteranceAnalysis.englishMeaning}"` : ''}

STRICT RULES:
1. Understand the user's message semantically, including Romanized/transliterated Indian-language speech (e.g. "ela unnavu" means "How are you?").
2. Respond to the user's ACTUAL question or intent. Do not invent a different question. Do not change the topic.
3. If the user asks a simple greeting or conversational question like "How are you?" ("Ela unnavu?", "Aap kaise ho?", "How are you?"), respond warmly that you are doing well and ask how to help. Do NOT generate a generic PM-AJAY registration question.
4. Respond in ${langConfig.name} in its standard native script.
5. Warm, respectful, supportive tone. Use simple, everyday spoken words suitable for low literacy beneficiaries.
6. Absolutely DO NOT use hyphens as punctuation separators in any text.
7. NEVER ask for or mention caste, religion, or sensitive demographic attributes.
8. Keep the replyText short, concise, and focused on one question at a time.
9. Extract skills ONLY from this canonical list if clearly present in the user speech:
${Array.from(validSkillMap.keys()).join(', ')}
10. Extract profile fields if mentioned by user: familyOccupation, currentLivelihood, education, interests, mobilityConstraints, employmentPreference ('self', 'wage', 'either'), district, block, village, incomeGoal (integer), experienceYears (integer).
11. Detect intent: 'answer', 'dont_know', 'repeat', 'correct', 'confirm', 'deny'. If user corrected a previous statement, set correctedField and correctedValue.

Respond strictly in valid JSON matching this schema:
{
  "replyText": "Warm spoken sentence in ${langConfig.name} native script answering the user's actual intent",
  "extractedSkills": ["valid_skill_key"],
  "identifiedPreference": "self" | "wage" | "either" | null,
  "followUpQuestion": "Short guiding question",
  "profileFields": {
    "familyOccupation": null,
    "currentLivelihood": null,
    "education": null,
    "interests": [],
    "mobilityConstraints": [],
    "district": null,
    "block": null,
    "incomeGoal": null,
    "experienceYears": null
  },
  "intent": "answer" | "dont_know" | "repeat" | "correct" | "confirm" | "deny",
  "correctedField": null,
  "correctedValue": null
}
`;

  // 3. Try Gemini LLM First
  try {
    const model = getGeminiModel();
    if (model) {
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const parsed = parseCleanJson(rawText);

      if (parsed && parsed.replyText) {
        // Whitelist skill keys
        const rawSkills = Array.isArray(parsed.extractedSkills) ? parsed.extractedSkills : [];
        const whitelistedSkills = rawSkills
          .map((k) => String(k).toLowerCase())
          .filter((k) => validSkillMap.has(k))
          .map((k) => validSkillMap.get(k));

        return {
          replyText: parsed.replyText,
          extractedSkills: whitelistedSkills,
          identifiedPreference: ['self', 'wage', 'either'].includes(parsed.identifiedPreference)
            ? parsed.identifiedPreference
            : null,
          followUpQuestion: parsed.followUpQuestion || null,
          profileFields: parsed.profileFields || {},
          intent: parsed.intent || 'answer',
          correctedField: parsed.correctedField || null,
          correctedValue: parsed.correctedValue || null,
          source: 'gemini'
        };
      }
    }
  } catch (geminiErr) {
    // Attempt Sarvam fallback
  }

  // 4. Try Sarvam Indic Client Fallback
  try {
    const sarvam = getSarvamClient();
    if (sarvam) {
      const completion = await sarvam.chat.completions({
        model: 'sarvam-105b-conversations',
        messages: [
          {
            role: 'system',
            content: 'You are an empathetic Indian livelihood skilling counselor. Output strictly valid JSON without hyphens as punctuation separators.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const rawText = completion.choices?.[0]?.message?.content || '';
      const parsed = parseCleanJson(rawText);

      if (parsed && parsed.replyText) {
        const rawSkills = Array.isArray(parsed.extractedSkills) ? parsed.extractedSkills : [];
        const whitelistedSkills = rawSkills
          .map((k) => String(k).toLowerCase())
          .filter((k) => validSkillMap.has(k))
          .map((k) => validSkillMap.get(k));

        return {
          replyText: parsed.replyText,
          extractedSkills: whitelistedSkills,
          identifiedPreference: ['self', 'wage', 'either'].includes(parsed.identifiedPreference)
            ? parsed.identifiedPreference
            : null,
          followUpQuestion: parsed.followUpQuestion || null,
          profileFields: parsed.profileFields || {},
          intent: parsed.intent || 'answer',
          correctedField: parsed.correctedField || null,
          correctedValue: parsed.correctedValue || null,
          source: 'sarvam'
        };
      }
    }
  } catch (sarvamErr) {
    // Rule based fallback
  }

  // 5. Deterministic Rule Based Extractor Fallback
  const ruleSkills = await extractSkillsFromText(userMessage);
  const ruleAttributes = extractProfileAttributes(userMessage, stage);
  const detectedIntent = detectUserIntent(userMessage);

  let fallbackReply = '';
  if (utteranceAnalysis.intent === 'greeting_how_are_you') {
    fallbackReply = langConfig.code === 'te'
      ? 'నేను బాగున్నాను! మీకు ఈరోజు నేను ఎలా సహాయపడగలను?'
      : langConfig.code === 'hi'
        ? 'मैं बिल्कुल ठीक हूँ! आज मैं आपकी क्या सहायता कर सकता हूँ?'
        : langConfig.code === 'ta'
          ? 'நான் நலமாக இருக்கிறேன்! இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?'
          : 'I am doing well! How can I help you today?';
  } else if (utteranceAnalysis.intent === 'request_training') {
    fallbackReply = langConfig.code === 'te'
      ? 'తప్పకుండా! మీకు టైలరింగ్, సోలార్ టెక్నీషియన్, డెయిరీ ఫార్మింగ్ వంటి ఉచిత నైపుణ్య శిక్షణలు అందుబాటులో ఉన్నాయి. మీరు ఏ రంగంలో శిక్షణ పొందాలనుకుంటున్నారు?'
      : langConfig.code === 'hi'
        ? 'ज़रूर! हमारे पास सिलाई, सोलर इंस्टॉलेशन और डेयरी जैसे कई मुफ्त प्रशिक्षण कार्यक्रम उपलब्ध हैं। आप किस काम में ट्रेनिंग लेना चाहते हैं?'
        : langConfig.code === 'ta'
          ? 'நிச்சயமாக! தையல், சோலார் மற்றும் பால் பண்ணை போன்ற இலவச பயிற்சிகள் உள்ளன. நீங்கள் எந்த துறையில் பயிற்சி பெற விரும்புகிறீர்கள்?'
          : 'Certainly! We offer free training in tailoring, solar technician, dairy farming, and more. Which trade or skill would you like to learn?';
  } else if (utteranceAnalysis.intent === 'request_job') {
    fallbackReply = langConfig.code === 'te'
      ? 'తప్పకుండా! మీ అర్హతలు మరియు నైపుణ్యాల ఆధారంగా ఉపాధి అవకాశాలు ఉన్నాయి. మీ విద్యార్హత మరియు మీరు ఏ రకమైన ఉద్యోగం కోసం చూస్తున్నారో చెప్పండి.'
      : langConfig.code === 'hi'
        ? 'ज़रूर! आपके हुनर और अनुभव के आधार पर कई रोजगार के अवसर हैं। कृपया अपनी योग्यता और पसंदीदा काम बताएं।'
        : langConfig.code === 'ta'
          ? 'நிச்சயமாக! உங்கள் தகுதிக்கு ஏற்ப வேலைவாய்ப்புகள் உள்ளன. உங்கள் கல்வித்தகுதி மற்றும் நீங்கள் விரும்பும் வேலை பற்றி கூறுங்கள்.'
          : 'Certainly! We have various employment opportunities based on your skills. Please share your education and the type of role you are looking for.';
  } else if (utteranceAnalysis.intent === 'greeting') {
    fallbackReply = langConfig.code === 'te'
      ? 'నమస్కారం! PM-AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. ఈరోజు మీకు నేను ఎలా సహాయపడగలను?'
      : langConfig.code === 'hi'
        ? 'नमस्ते! PM-AJAY आजीविका सहायक में आपका स्वागत है। आज मैं आपकी क्या मदद कर सकता हूँ?'
        : langConfig.code === 'ta'
          ? 'வணக்கம்! PM-AJAY வாழ்வாதார உதவியாளருக்கு வரவேற்கிறோம். இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?'
          : 'Hello! Welcome to the PM-AJAY Livelihood Assistant. How can I help you today?';
  } else {
    const fallbackPromptsForStage = STAGE_PROMPTS[stage] || STAGE_PROMPTS.greeting_consent;
    fallbackReply = fallbackPromptsForStage[language] || fallbackPromptsForStage.en;
  }

  return {
    replyText: fallbackReply,
    extractedSkills: ruleSkills,
    identifiedPreference: ruleAttributes.employmentPreference || null,
    followUpQuestion: null,
    profileFields: ruleAttributes,
    intent: detectedIntent.intent || utteranceAnalysis.intent,
    correctedField: detectedIntent.correctedField,
    correctedValue: detectedIntent.correctedValue,
    source: 'rule_fallback'
  };
};
