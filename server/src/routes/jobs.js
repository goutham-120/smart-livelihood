import express from 'express';
import { JobOpening } from '../models/JobOpening.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sanitizeString, sanitizeNumber, sanitizeArray } from '../middleware/security.js';

const router = express.Router();

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const district = sanitizeString(req.query.district, 80);
    const occupationKey = sanitizeString(req.query.occupationKey, 60);
    const status = sanitizeString(req.query.status, 20) || 'open';

    const filter = {};
    if (district) filter.district = new RegExp(`^${district}$`, 'i');
    if (occupationKey) filter.occupationKey = occupationKey;
    if (status && status !== 'all') filter.status = status;

    const jobs = await JobOpening.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.json({ jobs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve job listings' });
  }
});

// POST /api/jobs
router.post('/', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const title = sanitizeString(req.body.title, 120);
    const employer = sanitizeString(req.body.employer, 120);
    const district = req.user.role === 'admin' && req.body.district
      ? sanitizeString(req.body.district, 80)
      : req.user.district;
    const occupationKey = sanitizeString(req.body.occupationKey, 60);
    const wage = sanitizeNumber(req.body.wage, 15000);
    const openings = sanitizeNumber(req.body.openings, 1);
    const requiredSkills = sanitizeArray(req.body.requiredSkills);
    const contact = sanitizeString(req.body.contact, 100);

    if (!title || !employer || !occupationKey || !district) {
      return res.status(400).json({ error: 'Title, employer, occupationKey, and district are required' });
    }

    const job = await JobOpening.create({
      title,
      employer,
      district,
      occupationKey,
      wage,
      openings,
      requiredSkills,
      contact,
      status: 'open',
      isSynthetic: req.body.isSynthetic !== false
    });

    return res.status(201).json({ job });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create job opening' });
  }
});

// GET /api/jobs/:id/candidates
router.get('/:id/candidates', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const job = await JobOpening.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    if (req.user.role === 'officer' && job.district.toLowerCase() !== req.user.district.toLowerCase()) {
      return res.status(403).json({ error: 'Officer access limited to assigned district' });
    }

    // Find profiles in the same district
    const profiles = await Profile.find({
      district: new RegExp(`^${job.district}$`, 'i')
    }).populate('user', 'name phone email');

    // Rank candidates by skill match and suitability
    const candidates = profiles
      .filter((p) => p.user) // only valid users
      .map((p) => {
        let matchScore = 0;
        const matchedSkills = [];

        (p.skills || []).forEach((sk) => {
          const skNorm = String(sk).toLowerCase().replace(/[\s\-_]+/g, '_').trim();
          const skWord = String(sk).toLowerCase().replace(/[\s\-_]+/g, ' ').trim();
          const occKeyNorm = String(job.occupationKey || '').toLowerCase().replace(/[\s\-_]+/g, '_').trim();
          if (
            skNorm.includes(occKeyNorm) ||
            occKeyNorm.includes(skNorm) ||
            job.requiredSkills.some((rs) => {
              const rsNorm = String(rs).toLowerCase().replace(/[\s\-_]+/g, '_').trim();
              const rsWord = String(rs).toLowerCase().replace(/[\s\-_]+/g, ' ').trim();
              return rsNorm === skNorm || skWord === rsWord || skWord.includes(rsWord) || rsWord.includes(skWord);
            })
          ) {
            matchScore += 35;
            matchedSkills.push(sk);
          }
        });

        if (p.employmentPreference === 'wage' || p.employmentPreference === 'either') {
          matchScore += 20;
        }

        if (p.riskScore <= 30) {
          matchScore += 15;
        }

        return {
          user: p.user,
          profile: p,
          matchScore: Math.min(matchScore, 100),
          matchedSkills
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 30);

    return res.json({ job, candidates });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute candidate matches' });
  }
});

export default router;
