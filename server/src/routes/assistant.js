import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { generateEmpatheticResponse } from '../services/aiService.js';
import { extractLivelihoodProfile } from '../services/extract.js';
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

    // AI & Rule-based Extraction
    const [aiResult, ruleExtracted] = await Promise.all([
      generateEmpatheticResponse({
        userMessage: text,
        language: lang,
        userContext
      }),
      extractLivelihoodProfile(text)
    ]);

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

    return res.json({
      replyText: aiResult.replyText,
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
