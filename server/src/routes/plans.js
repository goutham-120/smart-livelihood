import express from 'express';
import { Plan } from '../models/Plan.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { Occupation } from '../models/Occupation.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sanitizeString, sanitizeNumber } from '../middleware/security.js';

const router = express.Router();

// POST /api/plans/generate
router.post('/generate', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const district = req.user.role === 'admin' && req.body.district
      ? sanitizeString(req.body.district, 80)
      : req.user.district || 'Warangal';

    const targetBeneficiaries = sanitizeNumber(req.body.targetBeneficiaries, 500);
    const budgetInr = sanitizeNumber(req.body.budgetInr, 5000000); // 50 Lakhs default

    const demands = await RegionDemand.find({ district: new RegExp(`^${district}$`, 'i') }).sort({ demandLevel: -1 });
    const occupations = await Occupation.find();
    const occMap = new Map();
    occupations.forEach((o) => occMap.set(o.key, o));

    // Top high-demand occupations
    const topDemands = demands.slice(0, 5);
    const totalDemandWeights = topDemands.reduce((sum, d) => sum + d.demandLevel, 0) || 1;

    let totalAllocatedBudget = 0;
    let expectedTotalPlacements = 0;
    let selfCount = 0;
    let wageCount = 0;

    const allocations = topDemands.map((d) => {
      const occ = occMap.get(d.occupationKey) || { sector: 'Skilling', nsqfLevel: 3, selfEmploymentViable: true };
      const share = d.demandLevel / totalDemandWeights;
      const beneficiaryCount = Math.round(targetBeneficiaries * share);
      const allocatedBudgetInr = Math.round(budgetInr * share);
      const expectedPlacements = Math.round(beneficiaryCount * 0.75); // 75% target placement rate

      totalAllocatedBudget += allocatedBudgetInr;
      expectedTotalPlacements += expectedPlacements;

      if (occ.selfEmploymentViable) {
        selfCount += Math.round(expectedPlacements * 0.4);
        wageCount += Math.round(expectedPlacements * 0.6);
      } else {
        wageCount += expectedPlacements;
      }

      return {
        sector: occ.sector || 'Skilling',
        occupationKey: d.occupationKey,
        beneficiaryCount,
        allocatedBudgetInr,
        expectedPlacements,
        trainingPartners: ['PMKVY Center', 'District Skill Development Society']
      };
    });

    const plan = await Plan.create({
      district,
      targetBeneficiaries,
      budgetInr,
      allocations,
      status: 'approved',
      projectedImpact: {
        avgMonthlyIncomeInr: 16500,
        overallPlacementRatePct: 75,
        selfEmploymentCount: selfCount,
        wageEmploymentCount: wageCount
      },
      createdBy: req.user._id
    });

    return res.status(201).json({ plan });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate livelihood plan' });
  }
});

// GET /api/plans
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'officer') {
      filter.district = new RegExp(`^${req.user.district}$`, 'i');
    } else if (req.user.role === 'admin' && req.query.district) {
      filter.district = new RegExp(`^${sanitizeString(req.query.district, 80)}$`, 'i');
    }

    const plans = await Plan.find(filter).sort({ createdAt: -1 }).limit(20);
    return res.json({ plans });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch livelihood plans' });
  }
});

export default router;
