import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Placement } from '../models/Placement.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { JobOpening } from '../models/JobOpening.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sanitizeString, sanitizeNumber, sanitizeArray } from '../middleware/security.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/officer/beneficiaries
router.get('/beneficiaries', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const district = req.user.role === 'admin' && req.query.district
      ? sanitizeString(req.query.district, 80)
      : req.user.district;

    const query = { role: 'beneficiary' };
    if (district) {
      query.district = new RegExp(`^${district}$`, 'i');
    }

    const beneficiaries = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(200);

    const userIds = beneficiaries.map((b) => b._id);
    const profiles = await Profile.find({ user: { $in: userIds } });
    const placements = await Placement.find({ user: { $in: userIds } });

    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.user.toString(), p));

    const placementMap = new Map();
    placements.forEach((pl) => {
      const uStr = pl.user.toString();
      if (!placementMap.has(uStr)) placementMap.set(uStr, []);
      placementMap.get(uStr).push(pl);
    });

    const combined = beneficiaries.map((b) => {
      const uId = b._id.toString();
      return {
        user: b,
        profile: profileMap.get(uId) || null,
        placements: placementMap.get(uId) || []
      };
    });

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'LIST_DISTRICT_BENEFICIARIES',
      district: req.user.district,
      details: { count: combined.length }
    });

    return res.json({ beneficiaries: combined });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve district beneficiaries' });
  }
});

// POST /api/officer/beneficiaries (assisted create)
router.post('/beneficiaries', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 100);
    const phone = sanitizeString(req.body.phone, 20);
    const email = sanitizeString(req.body.email, 120);
    const district = req.user.role === 'admin' && req.body.district
      ? sanitizeString(req.body.district, 80)
      : req.user.district;

    if (!name) {
      return res.status(400).json({ error: 'Beneficiary name is required' });
    }

    if (phone) {
      const existing = await User.findOne({ phone });
      if (existing) {
        return res.status(400).json({ error: 'A beneficiary with this phone number already exists' });
      }
    }

    const newUser = await User.create({
      name,
      phone: phone || undefined,
      email: email ? email.toLowerCase() : undefined,
      role: 'beneficiary',
      district: district || 'Warangal',
      createdBy: req.user._id,
      consent: {
        given: req.body.consentGiven !== false,
        at: new Date(),
        version: '1.0',
        language: sanitizeString(req.body.language, 10) || 'en'
      }
    });

    const profileData = {
      user: newUser._id,
      district: newUser.district,
      language: sanitizeString(req.body.language, 10) || 'en',
      dialect: sanitizeString(req.body.dialect, 40),
      state: 'Telangana',
      block: sanitizeString(req.body.block, 80),
      village: sanitizeString(req.body.village, 80),
      familyOccupation: sanitizeString(req.body.familyOccupation, 100),
      currentLivelihood: sanitizeString(req.body.currentLivelihood, 100),
      employmentPreference: ['self', 'wage', 'either'].includes(req.body.employmentPreference)
        ? req.body.employmentPreference
        : 'either',
      mobilityConstraints: sanitizeArray(req.body.mobilityConstraints),
      incomeGoal: sanitizeNumber(req.body.incomeGoal, 15000),
      weeklyHours: sanitizeNumber(req.body.weeklyHours, 40),
      channel: 'kiosk',
      skills: sanitizeArray(req.body.skills),
      education: sanitizeString(req.body.education, 50) || 'Middle School',
      isSynthetic: false
    };

    let riskScore = 0;
    const riskReasons = [];
    if (profileData.mobilityConstraints.length > 0) {
      riskScore += 25;
      riskReasons.push('Restricted geographical mobility');
    }
    if (profileData.education === 'Primary School' || profileData.education === 'None') {
      riskScore += 20;
      riskReasons.push('Low formal literacy');
    }
    if (profileData.skills.length === 0) {
      riskScore += 25;
      riskReasons.push('No recognized trade skill');
    }
    profileData.riskScore = riskScore;
    profileData.riskReasons = riskReasons;

    const newProfile = await Profile.create(profileData);

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'OFFICER_ASSISTED_BENEFICIARY_CREATE',
      target: newUser._id,
      targetModel: 'User',
      district: newUser.district,
      details: { name: newUser.name }
    });

    return res.status(201).json({
      beneficiary: {
        user: newUser,
        profile: newProfile
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create beneficiary registration' });
  }
});

// GET /api/analytics/overview?district=
router.get('/analytics/overview', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const targetDistrict = req.user.role === 'admin' && req.query.district
      ? sanitizeString(req.query.district, 80)
      : req.user.district || 'Warangal';

    const districtRegex = new RegExp(`^${targetDistrict}$`, 'i');

    const totalBeneficiaries = await User.countDocuments({ role: 'beneficiary', district: districtRegex });
    const profiles = await Profile.find({ district: districtRegex });
    const placements = await Placement.find({ district: districtRegex });
    const demands = await RegionDemand.find({ district: districtRegex });
    const jobs = await JobOpening.find({ district: districtRegex });

    // Funnel calculations
    const enrolled = placements.filter((p) => p.status === 'enrolled').length;
    const completed = placements.filter((p) => p.status === 'completed').length;
    const placed = placements.filter((p) => p.status === 'placed').length;
    const dropped = placements.filter((p) => p.status === 'dropped').length;

    const funnel = {
      registered: totalBeneficiaries,
      skillsIdentified: profiles.filter((p) => p.skills && p.skills.length > 0).length,
      trainingEnrolled: enrolled + completed + placed,
      certified: completed + placed,
      placedOrSelfEmployed: placed,
      dropouts: dropped
    };

    // Dropout Risk grouping
    let highRisk = 0;
    let medRisk = 0;
    let lowRisk = 0;
    profiles.forEach((p) => {
      if (p.riskScore >= 60) highRisk++;
      else if (p.riskScore >= 30) medRisk++;
      else lowRisk++;
    });

    // Trade breakdown & Demand vs Supply
    const tradeCounts = {};
    profiles.forEach((p) => {
      (p.skills || []).forEach((sk) => {
        tradeCounts[sk] = (tradeCounts[sk] || 0) + 1;
      });
    });

    const byTrade = Object.entries(tradeCounts)
      .map(([trade, count]) => ({ trade, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const demandVsSupply = demands.map((d) => {
      const supplyCount = tradeCounts[d.occupationKey] || 0;
      const jobOpenings = jobs
        .filter((j) => j.occupationKey === d.occupationKey && j.status === 'open')
        .reduce((sum, j) => sum + j.openings, 0);

      return {
        occupationKey: d.occupationKey,
        demandScore: d.demandLevel,
        openings: d.openings + jobOpenings,
        availableCandidates: supplyCount,
        avgIncome: d.avgIncome,
        gap: (d.openings + jobOpenings) - supplyCount
      };
    });

    const totalTrained = completed + placed + dropped;
    const placementRate = totalTrained > 0 ? Math.round((placed / totalTrained) * 100) : 0;

    return res.json({
      district: targetDistrict,
      funnel,
      byTrade,
      demandVsSupply,
      dropoutRisk: {
        high: highRisk,
        medium: medRisk,
        low: lowRisk
      },
      placementRate
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate district analytics' });
  }
});

export default router;
