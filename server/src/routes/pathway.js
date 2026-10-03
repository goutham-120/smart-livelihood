import express from 'express';
import { Profile } from '../models/Profile.js';
import { Journey } from '../models/Journey.js';
import { Occupation } from '../models/Occupation.js';
import { Course } from '../models/Course.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { sanitizeString, sanitizeNumber } from '../middleware/security.js';
import { computeSkillGapsAndRoadmap, calculateOpportunityMatchV2 } from '../services/matching.js';
import { getRegionalDataForDistrict } from '../services/regional.js';

const router = express.Router();

// GET /api/pathway/skill-gaps/:occupationKey
router.get('/skill-gaps/:occupationKey', optionalAuth, async (req, res) => {
  try {
    const profile = req.user ? await Profile.findOne({ user: req.user._id }) : null;
    const userSkills = profile ? profile.skills : [];
    const district = profile ? profile.district : (req.user?.district || req.query.district || 'Warangal');

    const result = await computeSkillGapsAndRoadmap(req.params.occupationKey, userSkills, district);
    if (!result) {
      return res.status(404).json({ error: 'Occupation not found' });
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to analyze skill gaps' });
  }
});

// GET /api/pathway/training/:occupationKey
router.get('/training/:occupationKey', async (req, res) => {
  try {
    const occ = await Occupation.findOne({ key: req.params.occupationKey });
    if (!occ) {
      return res.status(404).json({ error: 'Occupation not found' });
    }

    const courses = await Course.find({
      $or: [
        { skillsGained: { $in: occ.requiredSkills } },
        { nsqfLevel: occ.nsqfLevel }
      ]
    });

    return res.json({ occupation: occ, courses });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve training courses' });
  }
});

// GET /api/pathway/roadmap/:occupationKey
router.get('/roadmap/:occupationKey', optionalAuth, async (req, res) => {
  try {
    const profile = req.user ? await Profile.findOne({ user: req.user._id }) : null;
    const userSkills = profile ? profile.skills : [];
    const district = profile ? profile.district : (req.user?.district || req.query.district || 'Warangal');

    const result = await computeSkillGapsAndRoadmap(req.params.occupationKey, userSkills, district);
    if (!result) {
      return res.status(404).json({ error: 'Occupation roadmap unavailable' });
    }

    return res.json({
      occupationKey: req.params.occupationKey,
      occupation: result.occupation,
      roadmap: result.roadmap,
      readinessScore: result.readinessScore,
      skillsSummary: result.skillsSummary,
      applicableSchemes: result.applicableSchemes,
      nearbyCenters: result.nearbyCenters,
      localDemand: result.localDemand
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to build career roadmap' });
  }
});

// GET /api/pathway/progress
router.get('/progress', authenticate, async (req, res) => {
  try {
    let journey = await Journey.findOne({ user: req.user._id });
    if (!journey) {
      journey = await Journey.create({
        user: req.user._id,
        currentStage: 'discovery',
        milestones: [
          { name: 'Voice Assessment & Skill Identification', status: 'completed', completedAt: new Date() },
          { name: 'NSQF Course Enrollment', status: 'in_progress' },
          { name: 'Practical Assessment & Certification', status: 'pending' },
          { name: 'Placement / Enterprise Linkage', status: 'pending' }
        ]
      });
    }

    return res.json({ journey });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve milestone progress' });
  }
});

// POST /api/pathway/progress
router.post('/progress', authenticate, async (req, res) => {
  try {
    const stage = sanitizeString(req.body.stage, 40);
    const targetOccupation = sanitizeString(req.body.targetOccupation, 80);

    const journey = await Journey.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          currentStage: stage || 'skill_assessment',
          targetOccupation: targetOccupation || undefined
        }
      },
      { new: true, upsert: true }
    );

    return res.json({ journey });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update milestone progress' });
  }
});

// GET /api/pathway/meta
router.get('/meta', async (req, res) => {
  try {
    const sectors = await Occupation.distinct('sector');
    const nsqfLevels = await Occupation.distinct('nsqfLevel');

    return res.json({
      sectors,
      nsqfLevels,
      channels: ['web', 'kiosk', 'whatsapp', 'ivr'],
      districts: ['Warangal', 'Adilabad', 'Nalgonda']
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load pathway metadata' });
  }
});

// POST /api/pathway/what-if (Interactive simulation with before/after analysis)
router.post('/what-if', optionalAuth, async (req, res) => {
  try {
    const hypotheticalSkills = Array.isArray(req.body.skills) ? req.body.skills : [];
    const targetDistrict = sanitizeString(req.body.district, 80) || req.user?.district || 'Warangal';
    const employmentPreference = ['self', 'wage', 'either'].includes(req.body.employmentPreference)
      ? req.body.employmentPreference
      : 'either';
    const incomeGoal = sanitizeNumber(req.body.incomeGoal, 15000);
    const travelRequired = req.body.travelRequired === true;

    const currentProfile = req.user ? await Profile.findOne({ user: req.user._id }) : null;
    const baselineSkills = currentProfile ? currentProfile.skills : [];
    const baselineDistrict = currentProfile ? currentProfile.district : 'Warangal';

    const occupations = await Occupation.find();
    const regDataTarget = await getRegionalDataForDistrict(targetDistrict);
    const regDataBaseline = await getRegionalDataForDistrict(baselineDistrict);

    const simulatedProfile = {
      skills: Array.from(new Set([...baselineSkills, ...hypotheticalSkills])),
      employmentPreference,
      incomeGoal,
      mobilityConstraints: travelRequired ? [] : ['no_travel'],
      education: currentProfile ? currentProfile.education : 'Middle School'
    };

    const baselineMatches = await Promise.all(
      occupations.map((occ) => calculateOpportunityMatchV2(occ, currentProfile || {}, baselineDistrict, regDataBaseline))
    );

    const simulatedMatches = await Promise.all(
      occupations.map((occ) => calculateOpportunityMatchV2(occ, simulatedProfile, targetDistrict, regDataTarget))
    );

    const baselineMap = new Map();
    baselineMatches.forEach((m) => baselineMap.set(m.occupationKey, m.matchScore));

    const topMatches = [];
    const unlockedOptions = [];

    simulatedMatches.forEach((sim) => {
      const baseScore = baselineMap.get(sim.occupationKey) || 0;
      const scoreDiff = sim.matchScore - baseScore;
      const occ = sim.occupation;
      const estIncome = Math.round((occ.incomeMin + occ.incomeMax) / 2);

      const item = {
        occupationKey: sim.occupationKey,
        title: occ.title,
        sector: occ.sector,
        nsqfLevel: occ.nsqfLevel,
        readinessScore: sim.matchScore,
        matchScore: sim.matchScore,
        baselineScore: baseScore,
        scoreDiff,
        potentialMonthlyIncome: estIncome,
        track: sim.track
      };

      topMatches.push(item);
      if (baseScore < 50 && sim.matchScore >= 70) {
        unlockedOptions.push(item);
      }
    });

    topMatches.sort((a, b) => b.matchScore - a.matchScore);

    const avgBaselineScore = baselineMatches.length > 0
      ? Math.round(baselineMatches.reduce((acc, curr) => acc + curr.matchScore, 0) / baselineMatches.length)
      : 0;

    const avgSimulatedScore = simulatedMatches.length > 0
      ? Math.round(simulatedMatches.reduce((acc, curr) => acc + curr.matchScore, 0) / simulatedMatches.length)
      : 0;

    return res.json({
      testedSkills: hypotheticalSkills,
      targetDistrict,
      comparison: {
        beforeAvgScore: avgBaselineScore,
        afterAvgScore: avgSimulatedScore,
        impactGainPct: avgSimulatedScore - avgBaselineScore
      },
      unlockedOptions,
      topMatches: topMatches.slice(0, 6)
    });
  } catch (err) {
    console.error('What-if route error:', err);
    return res.status(500).json({ error: 'What-if simulation failed', details: err.message });
  }
});

export default router;
