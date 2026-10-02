import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// POST /api/admin/officers (Admin only)
router.post('/officers', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 100);
    const email = sanitizeString(req.body.email, 120).toLowerCase();
    const phone = sanitizeString(req.body.phone, 20);
    const password = sanitizeString(req.body.password, 128) || 'Officer@123';
    const district = sanitizeString(req.body.district, 80);
    const org = sanitizeString(req.body.org, 40) || 'department';

    if (!name || !email || !district) {
      return res.status(400).json({ error: 'Name, email, and assigned district are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const officer = await User.create({
      name,
      email,
      phone: phone || undefined,
      passwordHash,
      role: 'officer',
      org,
      district,
      createdBy: req.user._id,
      consent: {
        given: true,
        at: new Date(),
        version: '1.0',
        language: 'en'
      }
    });

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'ADMIN_CREATED_OFFICER',
      target: officer._id,
      targetModel: 'User',
      district: officer.district,
      details: { email, district, org }
    });

    return res.status(201).json({
      officer: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        phone: officer.phone,
        role: officer.role,
        district: officer.district,
        org: officer.org
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create officer account' });
  }
});

// GET /api/admin/users
router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const role = sanitizeString(req.query.role, 30);
    const district = sanitizeString(req.query.district, 80);

    const filter = {};
    if (role) filter.role = role;
    if (district) filter.district = new RegExp(`^${district}$`, 'i');

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list users' });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const district = sanitizeString(req.query.district, 80);
    const filter = {};
    if (district) filter.district = new RegExp(`^${district}$`, 'i');

    const logs = await AuditLog.find(filter)
      .populate('actor', 'name email role district')
      .sort({ at: -1 })
      .limit(100);

    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
