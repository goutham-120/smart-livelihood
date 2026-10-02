import express from 'express';
import { Profile } from '../models/Profile.js';
import { Journey } from '../models/Journey.js';
import { Occupation } from '../models/Occupation.js';
import { Course } from '../models/Course.js';
import { TrainingCenter } from '../models/TrainingCenter.js';
import { Scheme } from '../models/Scheme.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString, sanitizeNumber } from '../middleware/security.js';
import { computeSkillGapsAndRoadmap } from '../services/matching.js';

const router = express.Router();

// GET /api/pathway/skill-gaps/:occupationKey
router.get('/skill-gaps/:occupationKey', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const userSkills = profile ? profile.skills : [];
    const district = profile ? profile.district : (req.user.district || 'Warangal');

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
router.get('/roadmap/:occupationKey', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const userSkills = profile ? profile.skills : [];
    const district = profile ? profile.district : (req.user.district || 'Warangal');

    const result = await computeSkillGapsAndRoadmap(req.params.occupationKey, userSkills, district);
    if (!result) {
      return res.status(404).json({ error: 'Occupation roadmap unavailable' });
    }

    return res.json({
      occupationKey: req.params.occupationKey,
      roadmap: result.roadmap,
      readinessScore: result.readinessScore,
      skillsSummary: result.skillsSummary,
      applicableSchemes: result.applicableSchemes
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

// POST /api/pathway/what-if (Interactive simulation for exploring hypothetical skills & income impact)
router.post('/what-if', authenticate, async (req, res) => {
  try {
    const hypotheticalSkills = req.body.skills || [];
    const district = sanitizeString(req.body.district, 80) || req.user.district || 'Warangal';

    const occupations = await Occupation.find();
    const matches = occupations.map((occ) => {
      const required = occ.requiredSkills || [];
      const skillSet = new Set(hypotheticalSkills.map((s) => s.toLowerCase()));
      let matchedCount = 0;
      required.forEach((r) => {
        if (skillSet.has(r.toLowerCase())) matchedCount++;
      });

      const readinessScore = required.length > 0 ? Math.round((matchedCount / required.length) * 100) : 100;
      const potentialMonthlyIncome = Math.round((occ.incomeMin + occ.incomeMax) / 2);

      return {
        occupationKey: occ.key,
        title: occ.title,
        sector: occ.sector,
        nsqfLevel: occ.nsqfLevel,
        readinessScore,
        potentialMonthlyIncome
      };
    });

    matches.sort((a, b) => b.readinessScore - a.readinessScore);

    return res.json({
      testedSkills: hypotheticalSkills,
      topMatches: matches.slice(0, 5)
    });
  } catch (err) {
    return res.status(500).json({ error: 'What-if simulation failed' });
  }
});

export default router;
