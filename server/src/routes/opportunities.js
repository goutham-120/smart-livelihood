import express from 'express';
import { Occupation } from '../models/Occupation.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { TrainingCenter } from '../models/TrainingCenter.js';
import { Scheme } from '../models/Scheme.js';
import { Counselor } from '../models/Counselor.js';
import { Profile } from '../models/Profile.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';

const router = express.Router();

// GET /api/opportunities
router.get('/', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const district = profile ? profile.district : (req.user.district || 'Warangal');
    const userSkills = new Set((profile ? profile.skills : []).map((s) => s.toLowerCase()));
    const userPref = profile ? profile.employmentPreference : 'either';

    const occupations = await Occupation.find();
    const demands = await RegionDemand.find({ district: new RegExp(`^${district}$`, 'i') });
    const demandMap = new Map();
    demands.forEach((d) => demandMap.set(d.occupationKey, d));

    const centers = await TrainingCenter.find({ district: new RegExp(`^${district}$`, 'i') });
    const allSchemes = await Scheme.find();

    const opportunities = occupations.map((occ) => {
      const demand = demandMap.get(occ.key) || {
        demandLevel: 3,
        openings: 15,
        avgIncome: (occ.incomeMin + occ.incomeMax) / 2
      };

      // Matched training centers offering this trade
      const matchedCenters = centers.filter((c) =>
        c.trades.some((t) => t.toLowerCase().includes(occ.key.toLowerCase()) || occ.sector.toLowerCase().includes(t.toLowerCase()))
      );

      // Matched schemes
      const matchedSchemes = allSchemes.filter((s) =>
        s.targetTrades.length === 0 ||
        s.targetTrades.some((t) => t.toLowerCase() === occ.key.toLowerCase() || t.toLowerCase() === occ.sector.toLowerCase())
      );

      // Score breakdown calculation
      let skillMatchScore = 20; // baseline
      const reqSkills = occ.requiredSkills || [];
      if (reqSkills.length > 0) {
        let matchedCount = 0;
        reqSkills.forEach((rs) => {
          if (userSkills.has(rs.toLowerCase())) matchedCount++;
        });
        skillMatchScore = Math.round((matchedCount / reqSkills.length) * 100);
      }

      const demandScore = demand.demandLevel * 20; // scale 1-5 to 20-100
      let preferenceScore = 70;
      if (userPref === 'self' && occ.selfEmploymentViable) preferenceScore = 100;
      if (userPref === 'wage' && !occ.travelRequired) preferenceScore = 90;

      const totalScore = Math.round(
        skillMatchScore * 0.45 + demandScore * 0.35 + preferenceScore * 0.20
      );

      const track = occ.selfEmploymentViable && (userPref === 'self' || userPref === 'either')
        ? 'self'
        : 'wage';

      const breakdown = [
        {
          factor: 'Skill Match',
          score: skillMatchScore,
          weight: '45%',
          note: `${skillMatchScore}% alignment with your identified abilities`
        },
        {
          factor: 'Local Demand',
          score: demandScore,
          weight: '35%',
          note: `Level ${demand.demandLevel} market demand in ${district}`
        },
        {
          factor: 'Pathway Preference',
          score: preferenceScore,
          weight: '20%',
          note: `Suits your preference for ${track === 'self' ? 'micro-enterprise' : 'regular wage placement'}`
        }
      ];

      return {
        id: occ._id,
        occupationKey: occ.key,
        title: occ.title,
        titles: occ.titles,
        sector: occ.sector,
        nsqfLevel: occ.nsqfLevel,
        ncoCode: occ.ncoCode,
        incomeRange: { min: occ.incomeMin, max: occ.incomeMax },
        track,
        matchScore: totalScore,
        breakdown,
        demand: {
          level: demand.demandLevel,
          openings: demand.openings,
          avgIncome: demand.avgIncome
        },
        centers: matchedCenters.slice(0, 3),
        schemes: matchedSchemes.slice(0, 3),
        source: occ.source
      };
    });

    opportunities.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({ opportunities });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate tailored opportunities' });
  }
});

// GET /api/opportunities/self-employment/:occupationKey or /api/self-employment/:occupationKey
router.get(['/self-employment/:occupationKey', '/:occupationKey/self-employment'], async (req, res) => {
  try {
    const occupationKey = sanitizeString(req.params.occupationKey, 60);
    const occ = await Occupation.findOne({ key: occupationKey });
    if (!occ) {
      return res.status(404).json({ error: 'Occupation not found' });
    }

    const schemes = await Scheme.find({
      type: { $in: ['loan', 'subsidy', 'composite'] }
    }).limit(4);

    const counselors = await Counselor.find({ verified: true }).limit(3);

    const businessPlan = {
      occupationTitle: occ.title,
      summary: `Micro enterprise operational roadmap for setting up a viable ${occ.title} business under PM-AJAY support.`,
      keySteps: [
        'Complete NSQF Level ' + occ.nsqfLevel + ' trade skilling module',
        'Register for PM Vishwakarma / PMEGP collateral free loan',
        'Acquire essential toolkit and setup workshop or home-based unit',
        'Link with local market cooperatives and digital platforms'
      ],
      estimatedMonthlyRevenue: occ.incomeMax * 1.25,
      breakevenMonths: 3
    };

    const startupCostInr = occ.incomeMin * 3;

    return res.json({
      occupationKey: occ.key,
      title: occ.title,
      businessPlan,
      startupCostInr,
      schemes,
      counselors
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch self-employment pathway' });
  }
});

export default router;
