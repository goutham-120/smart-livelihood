import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { generateEmpatheticResponse } from '../services/aiService.js';
import { extractLivelihoodProfile, inferLivelihoodFromSkills, resolveSkillToCanonicalKey, getSkillsList } from '../services/extract.js';
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
        currentLivelihood: profile.currentLivelihood,
        familyOccupation: profile.familyOccupation,
        riskScore: profile.riskScore,
        voiceCompleted: profile.voiceCompleted
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process assistant dialogue' });
  }
});

export default router;
