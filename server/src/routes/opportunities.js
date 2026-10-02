import express from 'express';
import { Occupation } from '../models/Occupation.js';
import { Profile } from '../models/Profile.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { calculateOpportunityMatchV2 } from '../services/matching.js';
import { getRegionalDataForDistrict } from '../services/regional.js';
import { getSelfEmploymentGuide, createFinancialCounselorTask } from '../services/selfEmployment.js';

const router = express.Router();

// GET /api/opportunities
router.get('/', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const district = profile ? profile.district : (req.user.district || 'Warangal');

    const occupations = await Occupation.find();
    const regionalData = await getRegionalDataForDistrict(district);

    const matchPromises = occupations.map((occ) =>
      calculateOpportunityMatchV2(occ, profile || {}, district, regionalData)
    );

    const results = await Promise.all(matchPromises);

    const opportunities = results.map((resItem) => {
      const occ = resItem.occupation;
      return {
        id: occ._id,
        occupationKey: occ.key,
        title: occ.title,
        titles: occ.titles,
        sector: occ.sector,
        nsqfLevel: resItem.nsqfLevel,
        ncoCode: occ.ncoCode,
        incomeRange: { min: occ.incomeMin, max: occ.incomeMax },
        track: resItem.track,
        matchScore: resItem.matchScore,
        matchPct: resItem.matchPct,
        matched: resItem.matched,
        missing: resItem.missing,
        breakdown: resItem.breakdown,
        demand: resItem.demand,
        centers: (resItem.centers || []).slice(0, 3),
        schemes: (resItem.schemes || []).slice(0, 3),
        notes: resItem.notes,
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
    const district = sanitizeString(req.query.district, 80) || 'Warangal';
    const lang = sanitizeString(req.query.lang, 10) || 'en';

    const guide = await getSelfEmploymentGuide(occupationKey, district, lang);
    if (!guide) {
      return res.status(404).json({ error: 'Occupation not found or self employment guide unavailable' });
    }

    return res.json(guide);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch self employment pathway' });
  }
});

// POST /api/opportunities/counselor-request
router.post('/counselor-request', authenticate, async (req, res) => {
  try {
    const district = sanitizeString(req.body.district, 80) || req.user.district || 'Warangal';
    const titleNote = sanitizeString(req.body.titleNote, 100);

    const task = await createFinancialCounselorTask(req.user._id, district, null, titleNote);
    return res.status(201).json({ message: 'Financial counselor request created', task });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create counselor request' });
  }
});

export default router;
