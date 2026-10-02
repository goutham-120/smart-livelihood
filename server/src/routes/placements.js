import express from 'express';
import { Placement } from '../models/Placement.js';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString, sanitizeNumber } from '../middleware/security.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/placements
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'beneficiary') {
      filter.user = req.user._id;
    } else if (req.user.role === 'officer') {
      filter.district = new RegExp(`^${req.user.district}$`, 'i');
    } else if (req.user.role === 'admin') {
      if (req.query.district) {
        filter.district = new RegExp(`^${sanitizeString(req.query.district, 80)}$`, 'i');
      }
    }

    if (req.query.status) {
      filter.status = sanitizeString(req.query.status, 20);
    }
    if (req.query.courseKey) {
      filter.courseKey = sanitizeString(req.query.courseKey, 60);
    }

    const placements = await Placement.find(filter)
      .populate('user', 'name phone email district')
      .sort({ at: -1 })
      .limit(100);

    return res.json({ placements });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve placements' });
  }
});

// POST /api/placements
router.post('/', authenticate, async (req, res) => {
  try {
    let targetUserId = req.user._id;
    let targetDistrict = req.user.district;

    if (req.body.userId) {
      if (req.user.role === 'beneficiary' && req.body.userId !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Beneficiaries cannot create placements for other users' });
      }
      const targetUser = await User.findById(req.body.userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Beneficiary user not found' });
      }
      if (req.user.role === 'officer' && targetUser.district.toLowerCase() !== req.user.district.toLowerCase()) {
        return res.status(403).json({ error: 'Officers may only manage placements in their assigned district' });
      }
      targetUserId = targetUser._id;
      targetDistrict = targetUser.district;
    }

    const courseKey = sanitizeString(req.body.courseKey, 80);
    const status = ['enrolled', 'completed', 'placed', 'dropped'].includes(req.body.status)
      ? req.body.status
      : 'enrolled';
    const employer = sanitizeString(req.body.employer, 120);
    const wage = sanitizeNumber(req.body.wage, 0);
    const notes = sanitizeString(req.body.notes, 256);

    if (!courseKey) {
      return res.status(400).json({ error: 'Course key is required' });
    }

    const placement = await Placement.create({
      user: targetUserId,
      district: targetDistrict || 'Warangal',
      courseKey,
      status,
      employer: employer || undefined,
      wage,
      notes,
      at: req.body.at ? new Date(req.body.at) : new Date(),
      isSynthetic: false
    });

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'CREATE_PLACEMENT',
      target: placement._id,
      targetModel: 'Placement',
      district: targetDistrict,
      details: { courseKey, status, employer, wage }
    });

    return res.status(201).json({ placement });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record placement entry' });
  }
});

// PATCH /api/placements/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ error: 'Placement record not found' });
    }

    if (req.user.role === 'beneficiary') {
      if (placement.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized to modify this placement' });
      }
    } else if (req.user.role === 'officer') {
      if (placement.district.toLowerCase() !== req.user.district.toLowerCase()) {
        return res.status(403).json({ error: 'Officer access limited to assigned district' });
      }
    }

    const updates = {};
    if (req.body.status && ['enrolled', 'completed', 'placed', 'dropped'].includes(req.body.status)) {
      updates.status = req.body.status;
    }
    if (req.body.employer !== undefined) updates.employer = sanitizeString(req.body.employer, 120);
    if (req.body.wage !== undefined) updates.wage = sanitizeNumber(req.body.wage, 0);
    if (req.body.notes !== undefined) updates.notes = sanitizeString(req.body.notes, 256);

    const updated = await Placement.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'UPDATE_PLACEMENT_STATUS',
      target: updated._id,
      targetModel: 'Placement',
      district: updated.district,
      details: updates
    });

    return res.json({ placement: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update placement record' });
  }
});

export default router;
