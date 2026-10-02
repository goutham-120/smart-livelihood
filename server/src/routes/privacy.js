import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Placement } from '../models/Placement.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// POST /api/consent (or /api/privacy/consent)
router.post(['/', '/consent'], authenticate, async (req, res) => {
  try {
    const language = sanitizeString(req.body.language, 10) || 'en';
    const version = sanitizeString(req.body.version, 20) || '1.0';
    const given = req.body.given !== false;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          consent: {
            given,
            at: new Date(),
            version,
            language
          }
        }
      },
      { new: true }
    );

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'CONSENT_UPDATED',
      target: req.user._id,
      targetModel: 'User',
      district: req.user.district,
      details: { given, version, language }
    });

    return res.json({
      success: true,
      consent: user.consent
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record consent decision' });
  }
});

// GET /api/privacy/export
router.get('/export', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    const profile = await Profile.findOne({ user: req.user._id });
    const placements = await Placement.find({ user: req.user._id });

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'DATA_EXPORT_REQUESTED',
      target: req.user._id,
      targetModel: 'User',
      district: req.user.district
    });

    return res.json({
      exportDate: new Date(),
      user,
      profile,
      placements,
      dataRetentionPolicy: 'Data is retained strictly for welfare scheme alignment under PM-AJAY. Caste is never stored or processed.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate data export' });
  }
});

// DELETE /api/privacy/me
router.delete('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    await Profile.deleteOne({ user: userId });
    await Placement.deleteMany({ user: userId });
    await User.deleteOne({ _id: userId });

    return res.json({
      success: true,
      message: 'Account and associated profile data successfully purged in accordance with privacy rights.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete account data' });
  }
});

export default router;
