import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { generateEmpatheticResponse } from '../services/aiService.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// POST /api/assistant/message
router.post('/message', authenticate, async (req, res) => {
  try {
    const text = sanitizeString(req.body.text, 1000);
    const lang = sanitizeString(req.body.lang || req.body.language, 10) || 'en';
    const channel = sanitizeString(req.body.channel, 20) || 'web';

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

    const userContext = {
      name: userRecord ? userRecord.name : 'Beneficiary',
      district: profile.district,
      skills: profile.skills || [],
      employmentPreference: profile.employmentPreference,
      education: profile.education
    };

    const aiResult = await generateEmpatheticResponse({
      userMessage: text,
      language: lang,
      userContext
    });

    // If new skills were discovered by the AI, merge them into the profile
    const existingSkills = new Set(profile.skills || []);
    let profileUpdated = false;

    if (aiResult.extractedSkills && aiResult.extractedSkills.length > 0) {
      aiResult.extractedSkills.forEach((sk) => {
        if (!existingSkills.has(sk)) {
          existingSkills.add(sk);
          profileUpdated = true;
        }
      });
      profile.skills = Array.from(existingSkills);
    }

    if (aiResult.identifiedPreference && aiResult.identifiedPreference !== profile.employmentPreference) {
      profile.employmentPreference = aiResult.identifiedPreference;
      profileUpdated = true;
    }

    if (profileUpdated) {
      // Recalculate risk score
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

    return res.json({
      replyText: aiResult.replyText,
      extractedSkills: aiResult.extractedSkills,
      followUpQuestion: aiResult.followUpQuestion,
      updatedProfile: {
        skills: profile.skills,
        employmentPreference: profile.employmentPreference,
        riskScore: profile.riskScore
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process assistant dialogue' });
  }
});

export default router;
