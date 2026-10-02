import express from 'express';
import { TrainingCenter } from '../models/TrainingCenter.js';
import { Counselor } from '../models/Counselor.js';
import { Scheme } from '../models/Scheme.js';
import { Skill } from '../models/Skill.js';
import { Occupation } from '../models/Occupation.js';
import { Course } from '../models/Course.js';
import { sanitizeString } from '../middleware/security.js';

const router = express.Router();

// GET /api/directory/centers
router.get('/centers', async (req, res) => {
  try {
    const district = sanitizeString(req.query.district, 80);
    const trade = sanitizeString(req.query.trade, 80);

    const filter = {};
    if (district) {
      filter.district = new RegExp(`^${district}$`, 'i');
    }
    if (trade) {
      filter.trades = new RegExp(trade, 'i');
    }

    const centers = await TrainingCenter.find(filter).sort({ name: 1 }).limit(100);
    return res.json({ centers });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve training centers directory' });
  }
});

// GET /api/directory/counselors
router.get('/counselors', async (req, res) => {
  try {
    const district = sanitizeString(req.query.district, 80);
    const language = sanitizeString(req.query.language, 30);

    const filter = {};
    if (district) {
      filter.district = new RegExp(`^${district}$`, 'i');
    }
    if (language) {
      filter.languages = new RegExp(`^${language}$`, 'i');
    }

    const counselors = await Counselor.find(filter).sort({ name: 1 }).limit(50);
    return res.json({ counselors });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve counselors directory' });
  }
});

// GET /api/directory/schemes
router.get('/schemes', async (req, res) => {
  try {
    const type = sanitizeString(req.query.type, 30);
    const trade = sanitizeString(req.query.trade, 80);

    const filter = {};
    if (type) {
      filter.type = type;
    }
    if (trade) {
      filter.targetTrades = new RegExp(trade, 'i');
    }

    const schemes = await Scheme.find(filter).sort({ name: 1 });
    return res.json({ schemes });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve schemes directory' });
  }
});

// GET /api/directory/skills
router.get('/skills', async (req, res) => {
  try {
    const sector = sanitizeString(req.query.sector, 80);
    const filter = {};
    if (sector) filter.sector = new RegExp(`^${sector}$`, 'i');

    const skills = await Skill.find(filter).sort({ sector: 1, name: 1 });
    return res.json({ skills });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve skills list' });
  }
});

// GET /api/directory/occupations
router.get('/occupations', async (req, res) => {
  try {
    const sector = sanitizeString(req.query.sector, 80);
    const filter = {};
    if (sector) filter.sector = new RegExp(`^${sector}$`, 'i');

    const occupations = await Occupation.find(filter).sort({ sector: 1, title: 1 });
    return res.json({ occupations });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve occupations list' });
  }
});

// GET /api/directory/courses
router.get('/courses', async (req, res) => {
  try {
    const nsqfLevel = req.query.nsqfLevel ? Number(req.query.nsqfLevel) : null;
    const filter = {};
    if (nsqfLevel) filter.nsqfLevel = nsqfLevel;

    const courses = await Course.find(filter).sort({ nsqfLevel: 1, title: 1 });
    return res.json({ courses });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve courses list' });
  }
});

export default router;
