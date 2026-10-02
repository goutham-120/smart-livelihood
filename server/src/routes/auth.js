import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, sanitizeString } from '../middleware/security.js';

const router = express.Router();

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      district: user.district,
      org: user.org
    },
    secret,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 100);
    const email = sanitizeString(req.body.email, 120).toLowerCase();
    const phone = sanitizeString(req.body.phone, 20);
    const password = sanitizeString(req.body.password, 128);
    const district = sanitizeString(req.body.district, 80) || 'Warangal';
    const role = 'beneficiary'; // Public registrations default to beneficiary

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }
    }
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ error: 'An account with this phone number already exists' });
      }
    }

    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await User.create({
      name,
      email: email || undefined,
      phone: phone || undefined,
      passwordHash,
      role,
      district,
      consent: {
        given: Boolean(req.body.consentGiven),
        at: req.body.consentGiven ? new Date() : undefined,
        version: '1.0',
        language: sanitizeString(req.body.language, 10) || 'en'
      }
    });

    await Profile.create({
      user: user._id,
      district: user.district,
      language: sanitizeString(req.body.language, 10) || 'en',
      state: 'Telangana',
      employmentPreference: 'either',
      incomeGoal: 15000,
      skills: []
    });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
        org: user.org,
        consent: user.consent
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed. Please verify your details and retry.' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const identifier = sanitizeString(req.body.identifier || req.body.email || req.body.phone, 120);
    const password = sanitizeString(req.body.password, 128);

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier.toLowerCase() } : { phone: identifier };
    const user = await User.findOne(query);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
        org: user.org,
        consent: user.consent
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Login error occurred' });
  }
});

// POST /api/auth/otp/send
router.post('/otp/send', authLimiter, async (req, res) => {
  try {
    const phone = sanitizeString(req.body.phone, 20);
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (process.env.ALLOW_DEMO !== 'true') {
      return res.status(501).json({ error: 'SMS gateway is in production mode' });
    }

    return res.json({
      success: true,
      message: 'OTP sent to mobile phone (Demo mode: Use 123456)'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to dispatch OTP' });
  }
});

// POST /api/auth/otp/verify
router.post('/otp/verify', authLimiter, async (req, res) => {
  try {
    const phone = sanitizeString(req.body.phone, 20);
    const otp = sanitizeString(req.body.otp, 10);
    const name = sanitizeString(req.body.name, 100);
    const district = sanitizeString(req.body.district, 80) || 'Warangal';

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    if (process.env.ALLOW_DEMO === 'true') {
      if (otp !== '123456') {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: name || `User ${phone.slice(-4)}`,
        phone,
        role: 'beneficiary',
        district,
        consent: {
          given: true,
          at: new Date(),
          version: '1.0',
          language: 'en'
        }
      });

      await Profile.create({
        user: user._id,
        district: user.district,
        language: 'en',
        state: 'Telangana',
        employmentPreference: 'either',
        incomeGoal: 15000,
        skills: []
      });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
        org: user.org,
        consent: user.consent
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/auth/demo-login
router.post('/demo-login', authLimiter, async (req, res) => {
  try {
    if (process.env.ALLOW_DEMO !== 'true') {
      return res.status(403).json({ error: 'Demo logins are disabled in production' });
    }

    const role = sanitizeString(req.body.role, 30) || 'beneficiary';
    const district = sanitizeString(req.body.district, 80) || 'Warangal';

    let user = null;
    if (role === 'admin') {
      user = await User.findOne({ role: 'admin' });
    } else if (role === 'officer') {
      user = await User.findOne({ role: 'officer', district: new RegExp(`^${district}$`, 'i') });
      if (!user) user = await User.findOne({ role: 'officer' });
    } else {
      user = await User.findOne({ role: 'beneficiary', district: new RegExp(`^${district}$`, 'i') });
      if (!user) user = await User.findOne({ role: 'beneficiary' });
    }

    if (!user) {
      return res.status(404).json({ error: 'No demo account available. Please run npm run seed:demo' });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
        org: user.org,
        consent: user.consent
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Demo authentication failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        district: req.user.district,
        org: req.user.org,
        consent: req.user.consent
      },
      profile
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve profile data' });
  }
});

export default router;
