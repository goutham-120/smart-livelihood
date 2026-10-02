import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sanitizeString, sanitizeNumber } from '../middleware/security.js';
import { generateDistrictPerspectivePlan, getDistrictPlans } from '../services/planning.js';

const router = express.Router();

// GET /api/plans
router.get('/', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const district = req.user.role === 'admin' && req.query.district
      ? sanitizeString(req.query.district, 80)
      : req.user.district;

    const plans = await getDistrictPlans(district);
    return res.json({ plans });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list district plans' });
  }
});

// POST /api/plans/generate
router.post('/generate', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const district = req.user.role === 'admin' && req.body.district
      ? sanitizeString(req.body.district, 80)
      : (req.user.district || 'Warangal');

    const targetBeneficiaries = sanitizeNumber(req.body.targetBeneficiaries, 500);
    const budgetInr = sanitizeNumber(req.body.budgetInr, 5000000);

    const generated = await generateDistrictPerspectivePlan({
      district,
      targetBeneficiaries,
      budgetInr,
      createdById: req.user._id
    });

    return res.status(201).json(generated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate perspective plan' });
  }
});

export default router;
