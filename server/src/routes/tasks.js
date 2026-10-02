import express from 'express';
import { Task } from '../models/Task.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';

const router = express.Router();

// GET /api/tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'officer') {
      filter.district = new RegExp(`^${req.user.district}$`, 'i');
    } else if (req.user.role === 'admin') {
      if (req.query.district) {
        filter.district = new RegExp(`^${sanitizeString(req.query.district, 80)}$`, 'i');
      }
    } else if (req.user.role === 'beneficiary') {
      filter.beneficiary = req.user._id;
    }

    if (req.query.status) {
      filter.status = sanitizeString(req.query.status, 20);
    }
    if (req.query.assignedOrg) {
      filter.assignedOrg = sanitizeString(req.query.assignedOrg, 40);
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('beneficiary', 'name phone district')
      .populate('createdBy', 'name role')
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(100);

    return res.json({ tasks });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve task list' });
  }
});

// POST /api/tasks
router.post('/', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const title = sanitizeString(req.body.title, 150);
    const description = sanitizeString(req.body.description, 500);
    const assignedOrg = sanitizeString(req.body.assignedOrg, 40) || 'department';
    const district = req.user.role === 'admin' && req.body.district
      ? sanitizeString(req.body.district, 80)
      : req.user.district || 'Warangal';
    const assignedTo = req.body.assignedTo || null;
    const beneficiary = req.body.beneficiary || null;
    const priority = ['low', 'medium', 'high', 'urgent'].includes(req.body.priority)
      ? req.body.priority
      : 'medium';
    const dueAt = req.body.dueAt ? new Date(req.body.dueAt) : new Date(Date.now() + 7 * 86400000);

    if (!title || !assignedOrg) {
      return res.status(400).json({ error: 'Task title and assigned organization are required' });
    }

    const task = await Task.create({
      title,
      description,
      assignedOrg,
      assignedTo,
      district,
      beneficiary,
      priority,
      dueAt,
      createdBy: req.user._id,
      comments: []
    });

    return res.status(201).json({ task });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role === 'officer' && task.district.toLowerCase() !== req.user.district.toLowerCase()) {
      return res.status(403).json({ error: 'Officer access restricted to assigned district' });
    }

    const updates = {};
    if (req.body.status && ['open', 'in_progress', 'done'].includes(req.body.status)) {
      updates.status = req.body.status;
    }
    if (req.body.priority && ['low', 'medium', 'high', 'urgent'].includes(req.body.priority)) {
      updates.priority = req.body.priority;
    }
    if (req.body.assignedTo !== undefined) updates.assignedTo = req.body.assignedTo;

    let updatedTask;
    if (req.body.comment) {
      const commentText = sanitizeString(req.body.comment, 300);
      updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        {
          $set: updates,
          $push: {
            comments: {
              author: req.user._id,
              authorName: req.user.name,
              text: commentText,
              at: new Date()
            }
          }
        },
        { new: true }
      );
    } else {
      updatedTask = await Task.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    }

    return res.json({ task: updatedTask });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
