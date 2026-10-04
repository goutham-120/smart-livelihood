import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Conversation } from '../models/Conversation.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { generateEmpatheticResponse } from '../services/aiService.js';
import { extractLivelihoodProfile, inferLivelihoodFromSkills, resolveSkillToCanonicalKey, getSkillsList } from '../services/extract.js';
import { unifiedSpeechEngine } from '../channels/speech.js';
import {
  SUPPORTED_LANGUAGES,
  getLanguageConfig,
  normalizeLanguageCode,
  detectLanguageFromText
} from '../channels/languages.js';
import { logAudit } from '../middleware/audit.js';


const router = express.Router();

// Helper to generate a clean title from user text
function generateTitle(text) {
  if (!text) return 'New Conversation';
  const clean = text.trim().replace(/[^\w\s\u0C00-\u0C7F\u0900-\u097F]/gi, '');
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 5) return words.join(' ');
  return words.slice(0, 5).join(' ') + '...';
}

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

    console.log(`\n[VOICE]\nAudio received`);

    const sttResult = await unifiedSpeechEngine.transcribeAudio({
      audioBuffer,
      mimeType,
      candidateTranscript,
      language: languageHint
    });

    if (sttResult.error) {
      console.log(`\n[STT]\nerror: ${sttResult.error}`);
      return res.status(400).json({ error: sttResult.error });
    }

    const rawTranscript = sttResult.rawTranscript || sttResult.transcript || '';
    const displayTranscript = sttResult.displayTranscript || sttResult.transcript || '';
    const detectedSpeechCode = sttResult.speechCode || (sttResult.language ? `${sttResult.language}-IN` : 'en-IN');
    const detectedScript = sttResult.script || 'Deva';
    const langConfidence = sttResult.confidence || 0.98;

    console.log(`\n[STT]\nTranscript: ${rawTranscript}\n\n[STT]\nDetected language: ${detectedSpeechCode}\n\n[STT]\nLanguage confidence: ${langConfidence}\n\n[STT]\nDetected script: ${detectedScript}\n\n[NORMALIZATION]\nOriginal transcript: ${rawTranscript}\n\n[DISPLAY TRANSCRIPT]\n${displayTranscript}`);

    return res.json({
      rawTranscript,
      displayTranscript,
      transcript: displayTranscript,
      language: sttResult.language,
      languageName: sttResult.languageName,
      nativeName: sttResult.nativeName,
      speechCode: detectedSpeechCode,
      script: detectedScript,
      confidence: sttResult.confidence,
      provider: sttResult.provider
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Speech recognition service temporarily unavailable: ' + (err.message || 'Internal error')
    });
  }
});

// GET /api/assistant/conversations - List saved conversations for logged-in user or target beneficiary
router.get('/conversations', authenticate, async (req, res) => {
  try {
    let targetUserId = req.user._id;
    if (req.query.forUserId) {
      const forUserId = sanitizeString(req.query.forUserId, 40);
      if (forUserId !== req.user._id.toString()) {
        if (req.user.role === 'beneficiary') {
          return res.status(403).json({ error: 'Beneficiaries may only interact on their own account' });
        }
        targetUserId = forUserId;
      }
    }

    const conversations = await Conversation.find({
      user: targetUserId,
      'messages.0': { $exists: true }
    })
      .sort({ updatedAt: -1 })
      .select('_id title language updatedAt createdAt messages');

    const formatted = conversations.map((c) => {
      const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].text : '';
      return {
        _id: c._id,
        title: c.title || 'New Conversation',
        language: c.language || 'te',
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
        messageCount: c.messages ? c.messages.length : 0,
        preview: lastMsg.length > 55 ? lastMsg.slice(0, 55) + '...' : lastMsg
      };
    });

    return res.json({ conversations: formatted });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// GET /api/assistant/conversations/:id - Retrieve single conversation
router.get('/conversations/:id', authenticate, async (req, res) => {
  try {
    let targetUserId = req.user._id;
    if (req.query.forUserId) {
      const forUserId = sanitizeString(req.query.forUserId, 40);
      if (forUserId !== req.user._id.toString()) {
        if (req.user.role === 'beneficiary') {
          return res.status(403).json({ error: 'Beneficiaries may only interact on their own account' });
        }
        targetUserId = forUserId;
      }
    }

    const conv = await Conversation.findOne({ _id: req.params.id, user: targetUserId });
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    return res.json({ conversation: conv });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

// POST /api/assistant/conversations - Create a new empty conversation
router.post('/conversations', authenticate, async (req, res) => {
  try {
    let targetUserId = req.user._id;
    if (req.body.forUserId) {
      const forUserId = sanitizeString(req.body.forUserId, 40);
      if (forUserId !== req.user._id.toString()) {
        if (req.user.role === 'beneficiary') {
          return res.status(403).json({ error: 'Beneficiaries may only interact on their own account' });
        }
        targetUserId = forUserId;
      }
    }

    const lang = req.body.lang || 'te';
    const conv = await Conversation.create({
      user: targetUserId,
      title: 'New Conversation',
      language: lang,
      messages: []
    });
    return res.json({ conversation: conv });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// POST /api/assistant/confirm-insight - Confirm a profile evidence insight
router.post('/confirm-insight', authenticate, async (req, res) => {
  try {
    const { skill, experienceYears, education } = req.body;

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await Profile.create({ user: req.user._id, district: 'Warangal', state: 'Telangana' });
    }

    if (skill) {
      const skillsSet = new Set((profile.skills || []).map((s) => s.toLowerCase()));
      if (!skillsSet.has(skill.toLowerCase())) {
        profile.skills.push(skill);
      }
    }
    if (experienceYears && Number(experienceYears) > 0) {
      profile.experienceYears = Number(experienceYears);
    }
    if (education) {
      profile.education = education;
    }

    await profile.save();
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to confirm profile insight' });
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
  const conversationId = req.body.conversationId;

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

  // Find or create Conversation if targetUserId is available
  let conversation = null;
  if (targetUserId) {
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: targetUserId });
    }
    if (!conversation) {
      conversation = await Conversation.create({
        user: targetUserId,
        title: generateTitle(text),
        language: normLang,
        messages: []
      });
    } else if (conversation.title === 'New Conversation' || !conversation.title) {
      conversation.title = generateTitle(text);
    }
  }

  const historyContext = conversation
    ? (conversation.messages || []).slice(-6).map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
    : '';

  const userContext = {
    name: userRecord ? userRecord.name : 'Citizen',
    district: profile ? profile.district : 'Warangal',
    skills: profile ? profile.skills : [],
    employmentPreference: profile ? profile.employmentPreference : 'Open',
    education: profile ? profile.education : 'Not specified',
    historyContext
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
    const allSkills = await getSkillsList();
    const validKeySet = new Set(allSkills.map((s) => s.key));

    // Clean existing skills to strip legacy corrupt entries (e.g. 'd', 'ho', 'sma')
    const cleanedExisting = (profile.skills || [])
      .map((s) => resolveSkillToCanonicalKey(s, allSkills))
      .filter((s) => s && validKeySet.has(s));

    const existingSkills = new Set(cleanedExisting);
    let profileUpdated = cleanedExisting.length !== (profile.skills || []).length;

    // Merge skills safely
    const rawNewSkills = [
      ...(aiResult.extractedSkills || []),
      ...(ruleExtracted.skills || [])
    ];

    if (rawNewSkills.length > 0) {
      rawNewSkills.forEach((raw) => {
        const resolved = resolveSkillToCanonicalKey(raw, allSkills);
        if (resolved && validKeySet.has(resolved)) {
          if (!existingSkills.has(resolved)) {
            existingSkills.add(resolved);
            profileUpdated = true;
          }
        }
      });
    }

    profile.skills = Array.from(existingSkills);

    // Merge preference safely
    const pref = aiResult.identifiedPreference || ruleExtracted.employmentPreference;
    if (pref && pref !== profile.employmentPreference) {
      profile.employmentPreference = pref;
      profileUpdated = true;
    }

    // Merge Education safely
    const edu = aiResult.education || ruleExtracted.education;
    if (edu && edu !== profile.education) {
      profile.education = edu;
      profileUpdated = true;
    }

    // Merge Mobility Constraints safely
    const mob = (aiResult.mobilityConstraints && aiResult.mobilityConstraints.length > 0)
      ? aiResult.mobilityConstraints
      : ruleExtracted.mobilityConstraints;
    if (mob && mob.length > 0) {
      const existingMobility = new Set(profile.mobilityConstraints || []);
      mob.forEach((m) => existingMobility.add(m));
      profile.mobilityConstraints = Array.from(existingMobility);
      profileUpdated = true;
    }

    // Merge Income Goal safely
    const inc = aiResult.incomeGoal || ruleExtracted.incomeGoal;
    if (inc && inc > 0) {
      profile.incomeGoal = inc;
      profileUpdated = true;
    }

    // Merge Experience Years safely
    const exp = aiResult.experienceYears || ruleExtracted.experienceYears;
    if (exp && exp > 0) {
      profile.experienceYears = exp;
      profileUpdated = true;
    }

    // Merge Current Livelihood safely
    const curLiv = aiResult.currentLivelihood || ruleExtracted.currentLivelihood;
    if (curLiv && (!profile.currentLivelihood || profile.currentLivelihood.trim() === '')) {
      profile.currentLivelihood = curLiv;
      profileUpdated = true;
    }

    // Merge Family Occupation safely
    const famOcc = aiResult.familyOccupation || ruleExtracted.familyOccupation;
    if (famOcc && (!profile.familyOccupation || profile.familyOccupation.trim() === '')) {
      profile.familyOccupation = famOcc;
      profileUpdated = true;
    }

    // Infer Livelihood and Family Occupation from skills if still empty
    if ((!profile.currentLivelihood || !profile.familyOccupation) && profile.skills.length > 0) {
      const inferred = inferLivelihoodFromSkills(profile.skills);
      if (inferred.currentLivelihood && (!profile.currentLivelihood || profile.currentLivelihood.trim() === '')) {
        profile.currentLivelihood = inferred.currentLivelihood;
        profileUpdated = true;
      }
      if (inferred.familyOccupation && (!profile.familyOccupation || profile.familyOccupation.trim() === '')) {
        profile.familyOccupation = inferred.familyOccupation;
        profileUpdated = true;
      }
    }

    if (profileUpdated) {
      let riskScore = 0;
      const riskReasons = [];
      if (profile.mobilityConstraints && profile.mobilityConstraints.length > 0) {
        riskScore += 25;
        riskReasons.push('Restricted geographical mobility');
      }
      if (profile.education === 'Primary (5th)' || profile.education === 'Below Primary' || profile.education === 'None') {
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

  // Check for profile evidence insight
  let profileInsight = null;
  const cleanText = text ? text.trim() : '';
  const candidateSkill = (aiResult?.extractedSkills && aiResult.extractedSkills[0]) || (ruleExtracted?.skills && ruleExtracted.skills[0]);
  const candidateExp = ruleExtracted?.experienceYears ? `${ruleExtracted.experienceYears} years` : null;

  if (cleanText && (candidateSkill || candidateExp)) {
    profileInsight = {
      detectedSkill: candidateSkill || null,
      detectedExperience: candidateExp || null,
      rawText: cleanText,
      confirmed: false
    };
  }

  if (conversation) {
    conversation.messages.push({
      sender: 'user',
      text,
      timestamp: new Date()
    });

    conversation.messages.push({
      sender: 'ai',
      text: aiResult.replyText,
      timestamp: new Date(),
      profileInsight
    });

    conversation.language = normLang;
    await conversation.save();
  }

  return res.json({
    conversationId: conversation ? conversation._id : null,
    conversationTitle: conversation ? conversation.title : null,
    response: aiResult.replyText,
    replyText: aiResult.replyText,
    messages: conversation ? conversation.messages : undefined,
    profileInsight,
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
      currentLivelihood: profile.currentLivelihood,
      familyOccupation: profile.familyOccupation,
      riskScore: profile.riskScore,
      voiceCompleted: profile.voiceCompleted
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
    const langConfig = getLanguageConfig(normLang);
    console.log(`\n[TTS]\nlanguage: ${langConfig.speechCode} (${langConfig.name})\ntext: "${text.slice(0, 70).replace(/\n/g, ' ')}..."`);

    const result = await unifiedSpeechEngine.synthesizeAudio({
      text,
      language: normLang,
      speaker
    });

    console.log(`\n[PLAYBACK]\naudio generated: provider=${result.provider}, audioSize=${result.audioBase64 ? result.audioBase64.length : 0}`);

    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      error: 'Text-to-speech synthesis failed: ' + (err.message || 'Internal error')
    });
  }
});

export default router;
