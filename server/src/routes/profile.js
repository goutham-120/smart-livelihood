import express from 'express';
import { Profile } from '../models/Profile.js';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString, sanitizeNumber, sanitizeArray } from '../middleware/security.js';
import { logAudit } from '../middleware/audit.js';
import { inferLivelihoodFromSkills, resolveSkillToCanonicalKey, getSkillsList } from '../services/extract.js';


const router = express.Router();

// Helper to calculate dropout / livelihood risk score
const calculateRiskScore = (profileData) => {
  let score = 0;
  const reasons = [];

  if (profileData.mobilityConstraints && profileData.mobilityConstraints.length > 0) {
    score += 25;
    reasons.push('Restricted geographical mobility');
  }
  if (!profileData.education || profileData.education === 'None' || profileData.education === 'Primary School') {
    score += 20;
    reasons.push('Low formal education level');
  }
  if (!profileData.skills || profileData.skills.length === 0) {
    score += 25;
    reasons.push('No formal or verified market skills');
  }
  if (profileData.weeklyHours && profileData.weeklyHours < 20) {
    score += 15;
    reasons.push('Severe time availability constraints');
  }
  if (!profileData.currentLivelihood) {
    score += 15;
    reasons.push('Currently unengaged in regular livelihood');
  }

  return {
    riskScore: Math.min(score, 100),
    riskReasons: reasons
  };
};

// GET /api/profile or GET /api/profile/me
router.get(['/', '/me'], authenticate, async (req, res) => {
  try {
    let targetUserId = req.user._id;

    // If query has forUserId or userId, check permission
    if (req.query.userId || req.query.forUserId) {
      const requestedId = sanitizeString(req.query.userId || req.query.forUserId, 40);
      if (requestedId !== req.user._id.toString()) {
        if (req.user.role === 'beneficiary') {
          return res.status(403).json({ error: 'Beneficiaries may only access their own profile' });
        }
        const targetUser = await User.findById(requestedId);
        if (!targetUser) {
          return res.status(404).json({ error: 'User record not found' });
        }
        if (req.user.role === 'officer' && targetUser.district.toLowerCase() !== req.user.district.toLowerCase()) {
          return res.status(403).json({ error: 'Officer access restricted to assigned district' });
        }
        targetUserId = targetUser._id;

        await logAudit({
          actor: req.user._id,
          actorRole: req.user.role,
          action: 'VIEW_BENEFICIARY_PROFILE',
          target: targetUser._id,
          targetModel: 'User',
          district: targetUser.district
        });
      }
    }

    let profile = await Profile.findOne({ user: targetUserId });
    if (!profile) {
      const user = await User.findById(targetUserId);
      profile = await Profile.create({
        user: targetUserId,
        district: user ? user.district : 'Warangal',
        state: 'Telangana',
        language: 'en'
      });
    }

    const allSkills = await getSkillsList();
    const validKeySet = new Set(allSkills.map((s) => s.key));

    // Strip legacy corrupt entries (e.g. 'd', 'ho', 'sma')
    const cleanedSkills = (profile.skills || [])
      .map((s) => resolveSkillToCanonicalKey(s, allSkills))
      .filter((s) => s && validKeySet.has(s));

    if (cleanedSkills.length !== (profile.skills || []).length) {
      profile.skills = cleanedSkills;
      await profile.save();
    }

    if ((!profile.currentLivelihood || !profile.familyOccupation) && profile.skills && profile.skills.length > 0) {
      const inferred = inferLivelihoodFromSkills(profile.skills);
      let changed = false;
      if (inferred.currentLivelihood && (!profile.currentLivelihood || profile.currentLivelihood.trim() === '')) {
        profile.currentLivelihood = inferred.currentLivelihood;
        changed = true;
      }
      if (inferred.familyOccupation && (!profile.familyOccupation || profile.familyOccupation.trim() === '')) {
        profile.familyOccupation = inferred.familyOccupation;
        changed = true;
      }
      if (changed) {
        await profile.save();
      }
    }

    return res.json({ profile });
  } catch (err) {
    return res.status(500).json({ error: 'Unable to retrieve user profile' });
  }
});

// PUT /api/profile
router.put('/', authenticate, async (req, res) => {
  try {
    let targetUserId = req.user._id;

    if (req.body.userId || req.body.forUserId) {
      const requestedId = sanitizeString(req.body.userId || req.body.forUserId, 40);
      if (requestedId !== req.user._id.toString()) {
        if (req.user.role === 'beneficiary') {
          return res.status(403).json({ error: 'Beneficiaries cannot edit other profiles' });
        }
        const targetUser = await User.findById(requestedId);
        if (!targetUser) {
          return res.status(404).json({ error: 'Beneficiary record not found' });
        }
        if (req.user.role === 'officer' && targetUser.district.toLowerCase() !== req.user.district.toLowerCase()) {
          return res.status(403).json({ error: 'Officers may only manage beneficiaries within their district' });
        }
        targetUserId = targetUser._id;
      }
    }

    const updates = {};
    if (req.body.language !== undefined) updates.language = sanitizeString(req.body.language, 20);
    if (req.body.dialect !== undefined) updates.dialect = sanitizeString(req.body.dialect, 40);
    if (req.body.state !== undefined) updates.state = sanitizeString(req.body.state, 50);
    if (req.body.district !== undefined) updates.district = sanitizeString(req.body.district, 80);
    if (req.body.block !== undefined) updates.block = sanitizeString(req.body.block, 80);
    if (req.body.village !== undefined) updates.village = sanitizeString(req.body.village, 80);
    if (req.body.familyOccupation !== undefined) updates.familyOccupation = sanitizeString(req.body.familyOccupation, 100);
    if (req.body.currentLivelihood !== undefined) updates.currentLivelihood = sanitizeString(req.body.currentLivelihood, 100);
    if (req.body.employmentPreference !== undefined) {
      const pref = sanitizeString(req.body.employmentPreference, 20);
      if (['self', 'wage', 'either'].includes(pref)) {
        updates.employmentPreference = pref;
      }
    }
    if (req.body.mobilityConstraints !== undefined) {
      updates.mobilityConstraints = sanitizeArray(req.body.mobilityConstraints);
    }
    if (req.body.incomeGoal !== undefined) updates.incomeGoal = sanitizeNumber(req.body.incomeGoal, 15000);
    if (req.body.weeklyHours !== undefined) updates.weeklyHours = sanitizeNumber(req.body.weeklyHours, 40);
    if (req.body.channel !== undefined) {
      const ch = sanitizeString(req.body.channel, 20);
      if (['web', 'kiosk', 'whatsapp', 'ivr'].includes(ch)) {
        updates.channel = ch;
      }
    }
    if (req.body.skills !== undefined) {
      const allSkills = await getSkillsList();
      const validKeySet = new Set(allSkills.map((s) => s.key));
      const rawList = Array.isArray(req.body.skills)
        ? req.body.skills
        : String(req.body.skills).split(',').map((s) => s.trim()).filter(Boolean);

      updates.skills = Array.from(new Set(
        rawList
          .map((s) => resolveSkillToCanonicalKey(s, allSkills))
          .filter((s) => s && validKeySet.has(s))
      ));
    }
    if (req.body.education !== undefined) updates.education = sanitizeString(req.body.education, 50);
    if (req.body.experienceYears !== undefined) updates.experienceYears = sanitizeNumber(req.body.experienceYears, 0);
    if (req.body.voiceCompleted !== undefined) {
      updates.voiceCompleted = Boolean(req.body.voiceCompleted);
      if (updates.voiceCompleted) updates.voiceCompletedAt = new Date();
    }

    const calculated = calculateRiskScore(updates);
    updates.riskScore = calculated.riskScore;
    updates.riskReasons = calculated.riskReasons;

    const profile = await Profile.findOneAndUpdate(
      { user: targetUserId },
      { $set: updates },
      { new: true, upsert: true }
    );

    return res.json({ profile });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
});

export default router;
