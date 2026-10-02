/**
 * LLM Extraction and Empathetic Dialogue Service
 * Powered by Google Gemini with Sarvam Indic fallback and rule based recovery.
 * Strictly whitelists skill keys and enforces schema validation.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { SarvamAIClient } from 'sarvamai';
import { Skill } from '../models/Skill.js';
import { extractSkillsFromText, extractProfileAttributes, detectUserIntent } from './extract.js';
import { STAGE_PROMPTS, SUPPORTED_LANGUAGES } from '../channels/languages.js';

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

  // 2. Prepare structured system prompt for Gemini
  const prompt = `
You are an empathetic, encouraging livelihood voice counselor for rural and low literacy youth and women under India's PM AJAY welfare initiative.
Target Language: ${langConfig.name} (${langConfig.nativeName})
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

STRICT RULES:
1. Warm, respectful, supportive tone. Use simple, everyday spoken words suitable for low literacy beneficiaries.
2. Absolutely DO NOT use hyphens as punctuation separators in any text.
3. NEVER ask for or mention caste, religion, or sensitive demographic attributes.
4. Keep the replyText short, concise, and focused on one question at a time.
5. First acknowledge or reflect what the user said, then advance gently to the current stage goal.
6. Extract skills ONLY from this canonical list if clearly present in the user speech:
${Array.from(validSkillMap.keys()).join(', ')}
7. Extract profile fields if mentioned by user: familyOccupation, currentLivelihood, education, interests, mobilityConstraints, employmentPreference ('self', 'wage', 'either'), district, block, village, incomeGoal (integer), experienceYears (integer).
8. Detect intent: 'answer', 'dont_know', 'repeat', 'correct', 'confirm', 'deny'. If user corrected a previous statement, set correctedField and correctedValue.

Respond strictly in valid JSON matching this schema:
{
  "replyText": "Warm spoken sentence in ${langConfig.name}",
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

  const fallbackPromptsForStage = STAGE_PROMPTS[stage] || STAGE_PROMPTS.greeting_consent;
  const fallbackReply = fallbackPromptsForStage[language] || fallbackPromptsForStage.en;

  return {
    replyText: fallbackReply,
    extractedSkills: ruleSkills,
    identifiedPreference: ruleAttributes.employmentPreference || null,
    followUpQuestion: null,
    profileFields: ruleAttributes,
    intent: detectedIntent.intent,
    correctedField: detectedIntent.correctedField,
    correctedValue: detectedIntent.correctedValue,
    source: 'rule_fallback'
  };
};
