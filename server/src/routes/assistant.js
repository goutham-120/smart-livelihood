import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { logAudit } from '../middleware/audit.js';
import { processConversationTurn, clearSession } from '../services/conversation.js';
import { getSpeechProvider } from '../channels/speech.js';

const router = express.Router();

/**
 * POST /api/assistant/message
 * Handles channel agnostic dialogue turns for Web and Officer Assisted modes.
 */
router.post('/message', authenticate, async (req, res) => {
  try {
    const text = sanitizeString(req.body.text, 1000);
    const lang = sanitizeString(req.body.lang || req.body.language, 10) || 'te';
    const dialect = sanitizeString(req.body.dialect, 40) || '';
    const channel = sanitizeString(req.body.channel, 20) || 'web';

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    let targetUserId = req.user._id;

    // Check ownership or officer district authority if forUserId is specified
    if (req.body.forUserId) {
      const forUserId = sanitizeString(req.body.forUserId, 40);
      if (forUserId !== req.user._id.toString()) {
        if (req.user.role === 'beneficiary') {
          return res.status(403).json({ error: 'Beneficiaries may only interact on their own account' });
        }
        const targetUser = await User.findById(forUserId);
        if (!targetUser) {
          return res.status(404).json({ error: 'Beneficiary record not found' });
        }
        if (req.user.role === 'officer' && targetUser.district.toLowerCase() !== req.user.district.toLowerCase()) {
          return res.status(403).json({ error: 'Officers may only assist beneficiaries in their assigned district' });
        }
        targetUserId = targetUser._id;
      }
    }

    const sessionKey = `sess_${targetUserId}`;
    const result = await processConversationTurn({
      text,
      lang,
      dialect,
      channel,
      userId: req.user._id,
      forUserId: req.body.forUserId ? targetUserId : null,
      sessionKey
    });

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'ASSISTANT_DIALOGUE_TURN',
      target: targetUserId,
      targetModel: 'User',
      district: req.user.district,
      details: { stage: result.stage, isComplete: result.isComplete, channel }
    });

    return res.json({
      replyText: result.replyText,
      stage: result.stage,
      isComplete: result.isComplete || false,
      extractedSkills: result.extractedSkills || [],
      followUpQuestion: result.followUpQuestion || result.replyText,
      updatedProfile: result.updatedProfile || {},
      matchedOpportunities: result.matchedOpportunities || []
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process assistant dialogue' });
  }
});

/**
 * POST /api/assistant/reset
 * Resets active session state for fresh evaluation.
 */
router.post('/reset', authenticate, async (req, res) => {
  try {
    const targetUserId = req.body.forUserId ? sanitizeString(req.body.forUserId, 40) : req.user._id.toString();
    clearSession(`sess_${targetUserId}`);
    return res.json({ success: true, message: 'Conversation session reset successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset session' });
  }
});

/**
 * POST /api/assistant/speech/synthesize
 * Server side text to speech using Sarvam when configured.
 */
router.post('/speech/synthesize', authenticate, async (req, res) => {
  try {
    const text = sanitizeString(req.body.text, 1000);
    const language = sanitizeString(req.body.language, 10) || 'te';

    if (!text) {
      return res.status(400).json({ error: 'Text to synthesize is required' });
    }

    const provider = getSpeechProvider();
    const result = await provider.synthesize(text, language);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Speech synthesis failed' });
  }
});

/**
 * POST /api/assistant/speech/transcribe
 * Server side speech to text using Sarvam when configured.
 */
router.post('/speech/transcribe', authenticate, async (req, res) => {
  try {
    const language = sanitizeString(req.body.language, 10) || 'te';
    const audioBase64 = req.body.audioBase64;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const provider = getSpeechProvider();
    const result = await provider.transcribe(audioBuffer, language);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Speech transcription failed' });
  }
});

export default router;
