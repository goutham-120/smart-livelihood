import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { generateEmpatheticResponse } from '../services/aiService.js';
import { extractLivelihoodProfile } from '../services/extract.js';
import { unifiedSpeechEngine } from '../channels/speech.js';
import {
  SUPPORTED_LANGUAGES,
  getLanguageConfig,
  normalizeLanguageCode,
  detectLanguageFromText
} from '../channels/languages.js';

const router = express.Router();

/**
 * GET /api/assistant/languages
 * Returns list of 22 Scheduled Indian Languages + English with provider capability matrix.
 */
router.get('/languages', (req, res) => {
  return res.json({
    total: Object.keys(SUPPORTED_LANGUAGES).length,
    languages: SUPPORTED_LANGUAGES
  });
});

/**
 * POST /api/assistant/speech-to-text
 * Accepts audio recording (base64) or candidate transcript, performs automatic language detection across
 * 22 Scheduled Indian Languages + English, and returns verbatim transcription and structured language metadata.
 */
router.post('/speech-to-text', optionalAuth, async (req, res) => {
  try {
    const rawAudio = req.body.audio;
    const mimeType = sanitizeString(req.body.mimeType, 50) || 'audio/webm';
    const candidateTranscript = sanitizeString(req.body.transcript, 2000) || '';
    const languageHint = sanitizeString(req.body.language || req.body.lang, 20) || 'auto';

    if (!rawAudio && !candidateTranscript) {
      return res.status(400).json({
        error: 'No audio recording or transcript candidate provided'
      });
    }

    let audioBuffer = null;
    if (rawAudio) {
      const cleanBase64 = String(rawAudio).replace(/^data:audio\/\w+;base64,/, '');
      audioBuffer = Buffer.from(cleanBase64, 'base64');
    }

    const sttResult = await unifiedSpeechEngine.transcribeAudio({
      audioBuffer,
      mimeType,
      candidateTranscript,
      language: languageHint
    });

    if (sttResult.error) {
      return res.status(400).json({ error: sttResult.error });
    }

    return res.json({
      transcript: sttResult.transcript,
      language: sttResult.language,
      languageName: sttResult.languageName,
      nativeName: sttResult.nativeName,
      speechCode: sttResult.speechCode,
      confidence: sttResult.confidence,
      provider: sttResult.provider
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Speech recognition service temporarily unavailable: ' + (err.message || 'Internal error')
    });
  }
});

/**
 * Core conversation turn processor
 */
const handleDialogueTurn = async (req, res) => {
  const text = sanitizeString(req.body.message || req.body.text, 1500);
  const rawLang = sanitizeString(req.body.language || req.body.lang, 20);
  const channel = sanitizeString(req.body.channel, 20) || 'web';
  const phone = sanitizeString(req.body.phone, 20) || '9876543210';

  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  // Automatic language identification from text if language not explicitly provided, marked auto, or misclassified as en
  let langCode = rawLang;
  if (!langCode || langCode === 'auto' || normalizeLanguageCode(langCode) === 'en') {
    const detected = detectLanguageFromText(text);
    if (detected.language !== 'en' || !langCode || langCode === 'auto') {
      langCode = detected.language;
    }
  }
  const normLang = normalizeLanguageCode(langCode);
  const langConfig = getLanguageConfig(normLang);

  let targetUserId = req.user ? req.user._id : null;

  // Support officer assistance on behalf of a beneficiary
  if (req.body.forUserId && req.user) {
    const forUserId = sanitizeString(req.body.forUserId, 40);
    if (forUserId !== req.user._id.toString()) {
      if (req.user.role === 'beneficiary') {
        return res.status(403).json({ error: 'Beneficiaries may only interact on their own account' });
      }
      const targetUser = await User.findById(forUserId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Beneficiary record not found' });
      }
      if (req.user.role === 'officer' && targetUser.district?.toLowerCase() !== req.user.district?.toLowerCase()) {
        return res.status(403).json({ error: 'Officers may only assist beneficiaries in their assigned district' });
      }
      targetUserId = targetUser._id;
    }
  }

  // Find or create session user for unauthenticated or demo testing
  let userRecord = targetUserId ? await User.findById(targetUserId) : null;
  if (!userRecord && phone) {
    userRecord = await User.findOne({ phone });
    if (!userRecord) {
      userRecord = await User.create({
        name: `Citizen (${phone.slice(-4)})`,
        phone,
        role: 'beneficiary',
        district: 'Warangal',
        consent: { given: true, at: new Date(), version: '1.0', language: normLang }
      });
    }
    targetUserId = userRecord._id;
  }

  let profile = targetUserId ? await Profile.findOne({ user: targetUserId }) : null;
  if (!profile && targetUserId) {
    profile = await Profile.create({
      user: targetUserId,
      district: userRecord ? userRecord.district : 'Warangal',
      state: 'Telangana',
      channel,
      language: normLang
    });
  }

  const userContext = {
    name: userRecord ? userRecord.name : 'Citizen',
    district: profile ? profile.district : 'Warangal',
    skills: profile ? profile.skills : [],
    employmentPreference: profile ? profile.employmentPreference : 'Open',
    education: profile ? profile.education : 'Not specified'
  };

  // AI & Rule-based Extraction in the detected language
  const [aiResult, ruleExtracted] = await Promise.all([
    generateEmpatheticResponse({
      userMessage: text,
      language: normLang,
      userContext
    }),
    extractLivelihoodProfile(text)
  ]);

  if (profile) {
    const existingSkills = new Set((profile.skills || []).map((s) => s.toLowerCase()));
    let profileUpdated = false;

    // Merge skills safely
    const newSkills = Array.from(new Set([
      ...(aiResult.extractedSkills || []),
      ...(ruleExtracted.skills || [])
    ]));

    if (newSkills.length > 0) {
      newSkills.forEach((sk) => {
        if (!existingSkills.has(sk.toLowerCase())) {
          existingSkills.add(sk.toLowerCase());
          profileUpdated = true;
        }
      });
      profile.skills = Array.from(existingSkills);
    }

    // Merge preference safely
    const pref = aiResult.identifiedPreference || ruleExtracted.employmentPreference;
    if (pref && pref !== profile.employmentPreference) {
      profile.employmentPreference = pref;
      profileUpdated = true;
    }

    // Merge Education safely
    if (ruleExtracted.education && ruleExtracted.education !== profile.education) {
      profile.education = ruleExtracted.education;
      profileUpdated = true;
    }

    // Merge Mobility Constraints safely
    if (ruleExtracted.mobilityConstraints && ruleExtracted.mobilityConstraints.length > 0) {
      const existingMobility = new Set(profile.mobilityConstraints || []);
      ruleExtracted.mobilityConstraints.forEach((m) => existingMobility.add(m));
      profile.mobilityConstraints = Array.from(existingMobility);
      profileUpdated = true;
    }

    // Merge Income Goal safely
    if (ruleExtracted.incomeGoal && ruleExtracted.incomeGoal > 0) {
      profile.incomeGoal = ruleExtracted.incomeGoal;
      profileUpdated = true;
    }

    // Merge Experience Years safely
    if (ruleExtracted.experienceYears && ruleExtracted.experienceYears > 0) {
      profile.experienceYears = ruleExtracted.experienceYears;
      profileUpdated = true;
    }

    // Merge Current Livelihood safely
    if (ruleExtracted.currentLivelihood && !profile.currentLivelihood) {
      profile.currentLivelihood = ruleExtracted.currentLivelihood;
      profileUpdated = true;
    }

    if (profileUpdated) {
      let riskScore = 0;
      const riskReasons = [];
      if (profile.mobilityConstraints && profile.mobilityConstraints.length > 0) {
        riskScore += 25;
        riskReasons.push('Restricted geographical mobility');
      }
      if (profile.education === 'Primary School' || profile.education === 'None') {
        riskScore += 20;
        riskReasons.push('Low formal education level');
      }
      if (profile.skills.length === 0) {
        riskScore += 25;
        riskReasons.push('No market skills');
      }
      profile.riskScore = riskScore;
      profile.riskReasons = riskReasons;
      await profile.save();
    }
  }

  return res.json({
    response: aiResult.replyText,
    replyText: aiResult.replyText,
    language: normLang,
    languageName: langConfig.name,
    nativeName: langConfig.nativeName,
    speechCode: langConfig.speechCode,
    extractedSkills: profile ? profile.skills : aiResult.extractedSkills || [],
    followUpQuestion: aiResult.followUpQuestion,
    updatedProfile: profile ? {
      skills: profile.skills,
      employmentPreference: profile.employmentPreference,
      education: profile.education,
      mobilityConstraints: profile.mobilityConstraints,
      incomeGoal: profile.incomeGoal,
      experienceYears: profile.experienceYears,
      riskScore: profile.riskScore
    } : null
  });
};

/**
 * POST /api/assistant/chat
 * Primary multilingual conversational endpoint. Accepts arbitrary user speech in any language,
 * processes context, and returns response in the SAME detected language.
 */
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    return await handleDialogueTurn(req, res);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process assistant dialogue: ' + err.message });
  }
});

/**
 * POST /api/assistant/message
 * Preserved for backwards compatibility with earlier client calls.
 */
router.post('/message', optionalAuth, async (req, res) => {
  try {
    return await handleDialogueTurn(req, res);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process assistant dialogue: ' + err.message });
  }
});

/**
 * POST /api/assistant/text-to-speech
 * Synthesizes text in the user's detected language into speech audio via Sarvam AI,
 * or returns structured metadata for client-side speech synthesis fallback.
 */
router.post('/text-to-speech', optionalAuth, async (req, res) => {
  try {
    const text = sanitizeString(req.body.text, 2000);
    const rawLang = sanitizeString(req.body.language || req.body.lang, 20) || 'te';
    const speaker = sanitizeString(req.body.speaker, 30) || 'meera';

    if (!text) {
      return res.status(400).json({ error: 'Text to synthesize is required' });
    }

    const normLang = normalizeLanguageCode(rawLang);
    const result = await unifiedSpeechEngine.synthesizeAudio({
      text,
      language: normLang,
      speaker
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      error: 'Text-to-speech synthesis failed: ' + (err.message || 'Internal error')
    });
  }
});

export default router;
