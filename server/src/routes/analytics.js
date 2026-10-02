import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Placement } from '../models/Placement.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { JobOpening } from '../models/JobOpening.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';

const router = express.Router();

const sanitizeCell = (val) => {
  if (typeof val === 'number') {
    if (val > 0 && val < 5) return 0;
  }
  return val;
};

// GET /api/analytics/overview
router.get('/overview', authenticate, requireRole('officer', 'admin'), async (req, res) => {
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

    const enrolled = placements.filter((p) => p.status === 'enrolled').length;
    const completed = placements.filter((p) => p.status === 'completed').length;
    const placed = placements.filter((p) => p.status === 'placed').length;
    const dropped = placements.filter((p) => p.status === 'dropped').length;

    const profiledCount = profiles.filter((p) => p.skills && p.skills.length > 0).length;
    const recommendedCount = Math.round(profiledCount * 0.9);

    const funnel = {
      profiled: sanitizeCell(profiledCount),
      recommended: sanitizeCell(recommendedCount),
      enrolled: sanitizeCell(enrolled),
      completed: sanitizeCell(completed),
      placed: sanitizeCell(placed),
      registered: sanitizeCell(totalBeneficiaries),
      trainingEnrolled: sanitizeCell(enrolled + completed + placed),
      certified: sanitizeCell(completed + placed),
      placedOrSelfEmployed: sanitizeCell(placed),
      dropouts: sanitizeCell(dropped)
    };

    let highRisk = 0;
    let medRisk = 0;
    let lowRisk = 0;
    profiles.forEach((p) => {
      if (p.riskScore >= 60) highRisk++;
      else if (p.riskScore >= 30) medRisk++;
      else lowRisk++;
    });

    const dropoutRisk = {
      high: sanitizeCell(highRisk),
      medium: sanitizeCell(medRisk),
      low: sanitizeCell(lowRisk)
    };

    const tradeCounts = {};
    profiles.forEach((p) => {
      (p.skills || []).forEach((sk) => {
        tradeCounts[sk] = (tradeCounts[sk] || 0) + 1;
      });
    });

    const byTrade = Object.entries(tradeCounts)
      .map(([trade, count]) => ({
        trade,
        count: sanitizeCell(count)
      }))
      .filter((t) => t.count >= 5 || t.count === 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const demandVsSupply = demands.map((d) => {
      const rawSupply = tradeCounts[d.occupationKey] || 0;
      const jobOpenings = jobs
        .filter((j) => j.occupationKey === d.occupationKey && j.status === 'open')
        .reduce((sum, j) => sum + j.openings, 0);

      const totalDemand = d.openings + jobOpenings;
      return {
        occupationKey: d.occupationKey,
        demandScore: d.demandLevel,
        demandLevel: d.demandLevel,
        openings: sanitizeCell(totalDemand),
        availableCandidates: sanitizeCell(rawSupply),
        avgIncome: d.avgIncome,
        gap: totalDemand - rawSupply,
        isSynthetic: d.isSynthetic !== undefined ? d.isSynthetic : true
      };
    });

    const totalTrained = completed + placed + dropped;
    const placementRate = totalTrained > 0 ? Math.round((placed / totalTrained) * 100) : 0;

    return res.json({
      district: targetDistrict,
      funnel,
      byTrade,
      demandVsSupply,
      dropoutRisk,
      placementRate
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate district analytics' });
  }
});

export default router;
