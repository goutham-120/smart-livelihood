import { GoogleGenerativeAI } from '@google/generative-ai';
import { SarvamAIClient } from 'sarvamai';
import { Skill } from '../models/Skill.js';

let geminiClient = null;
let sarvamClient = null;

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
  const allSkills = await Skill.find().select('key name names aliases sector');
  const validSkillKeys = new Set(allSkills.map((s) => s.key));

  const prompt = `
You are an empathetic, supportive livelihood assistant for rural and low literacy youth and women in India (PM-AJAY welfare and skilling initiative).
The user is speaking in ${language} (or a regional dialect).
Current Beneficiary Profile Context:
- Name: ${userContext.name || 'Friend'}
- District: ${userContext.district || 'Warangal, Telangana'}
- Existing Skills: ${(userContext.skills || []).join(', ') || 'None recorded yet'}
- Employment Preference: ${userContext.employmentPreference || 'Open'}
- Education Level: ${userContext.education || 'Not specified'}

User input: "${userMessage}"

INSTRUCTIONS:
1. Respond in a warm, simple, supportive, and encouraging tone in the user's preferred language (${language}). Use simple everyday words suitable for low literacy beneficiaries. Never use hyphens as punctuation separators in text.
2. NEVER ask for or mention caste or sensitive personal attributes.
3. Identify if the user mentions any work skills, hobbies, daily tasks, agricultural experience, crafting, repair, cooking, driving, animal care, tailoring, sales, or mobile usage.
4. Extract only valid skills from this canonical list if matching:
[${Array.from(validSkillKeys).join(', ')}]

You MUST return your output strictly in this JSON format with no additional text:
{
  "replyText": "Warm spoken reply text here",
  "extractedSkills": ["skill_key_1", "skill_key_2"],
  "identifiedPreference": "self" | "wage" | "either" | null,
  "followUpQuestion": "A short guiding question to discover more about what they enjoy doing"
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
            content: 'You are an empathetic Indian livelihood skilling counselor. Output strictly valid JSON with replyText and extractedSkills.'
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
        return {
          replyText: parsed.replyText,
          extractedSkills: filteredSkills,
          identifiedPreference: ['self', 'wage', 'either'].includes(parsed.identifiedPreference) ? parsed.identifiedPreference : null,
          followUpQuestion: parsed.followUpQuestion || null
        };
      }
    }
  } catch (sarvamError) {
    // Fallback fallback rule-based response
  }

  // Graceful rule-based empathetic fallback
  return {
    replyText: `Namaste! Thank you for sharing. We are here to support your skilling and livelihood path. Tell us what kind of work you have done before or what skills you want to learn.`,
    extractedSkills: [],
    identifiedPreference: null,
    followUpQuestion: 'Would you prefer to start your own micro business or take up a wage employment job?'
  };
};
