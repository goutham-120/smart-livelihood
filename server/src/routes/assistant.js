import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Conversation } from '../models/Conversation.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { generateEmpatheticResponse } from '../services/aiService.js';
import { extractLivelihoodProfile } from '../services/extract.js';
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

// POST /api/assistant/message - Send message with persistent conversation context
router.post('/message', authenticate, async (req, res) => {
  try {
    const text = sanitizeString(req.body.text, 1000);
    const lang = sanitizeString(req.body.lang || req.body.language, 10) || 'en';
    const channel = sanitizeString(req.body.channel, 20) || 'web';
    const conversationId = req.body.conversationId;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    let targetUserId = req.user._id;

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

    const userRecord = await User.findById(targetUserId);
    let profile = await Profile.findOne({ user: targetUserId });
    if (!profile) {
      profile = await Profile.create({
        user: targetUserId,
        district: userRecord ? userRecord.district : 'Warangal',
        state: 'Telangana',
        channel
      });
    }

    // Find or create Conversation
    let conversation = null;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: targetUserId });
    }
    if (!conversation) {
      conversation = await Conversation.create({
        user: targetUserId,
        title: generateTitle(text),
        language: lang,
        messages: []
      });
    } else if (conversation.title === 'New Conversation' || !conversation.title) {
      conversation.title = generateTitle(text);
    }

    // Context from previous messages in this conversation
    const historyContext = (conversation.messages || [])
      .slice(-6)
      .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const userContext = {
      name: userRecord ? userRecord.name : 'Beneficiary',
      district: profile.district,
      skills: profile.skills || [],
      employmentPreference: profile.employmentPreference,
      education: profile.education,
      historyContext
    };

    // AI & Rule-based Extraction
    const [aiResult, ruleExtracted] = await Promise.all([
      generateEmpatheticResponse({
        userMessage: text,
        language: lang,
        userContext
      }),
      extractLivelihoodProfile(text)
    ]);

    // Check for profile evidence insight (only for valid non-empty user text)
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

    // Save User message
    conversation.messages.push({
      sender: 'user',
      text,
      timestamp: new Date()
    });

    // Save AI message
    conversation.messages.push({
      sender: 'ai',
      text: aiResult.replyText,
      timestamp: new Date(),
      profileInsight
    });

    conversation.language = lang;
    await conversation.save();

    return res.json({
      conversationId: conversation._id,
      conversationTitle: conversation.title,
      replyText: aiResult.replyText,
      messages: conversation.messages,
      profileInsight,
      extractedSkills: profile.skills,
      followUpQuestion: aiResult.followUpQuestion,
      updatedProfile: {
        skills: profile.skills,
        employmentPreference: profile.employmentPreference,
        education: profile.education,
        mobilityConstraints: profile.mobilityConstraints,
        incomeGoal: profile.incomeGoal,
        experienceYears: profile.experienceYears,
        riskScore: profile.riskScore
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process assistant dialogue' });
  }
});

export default router;

