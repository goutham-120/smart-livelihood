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
      .populate('comments.author', 'name role')
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

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('beneficiary', 'name phone district')
      .populate('createdBy', 'name role')
      .populate('comments.author', 'name role');

    return res.status(201).json({ task: populatedTask });
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
    if (req.body.title) updates.title = sanitizeString(req.body.title, 150);
    if (req.body.description !== undefined) updates.description = sanitizeString(req.body.description, 500);
    if (req.body.assignedOrg && ['corporation', 'department', 'ministry', 'training_partner'].includes(req.body.assignedOrg)) {
      updates.assignedOrg = req.body.assignedOrg;
    }
    if (req.body.district) updates.district = sanitizeString(req.body.district, 80);
    if (req.body.dueAt) updates.dueAt = new Date(req.body.dueAt);
    if (req.body.status && ['open', 'in_progress', 'done'].includes(req.body.status)) {
      updates.status = req.body.status;
    }
    if (req.body.priority && ['low', 'medium', 'high', 'urgent'].includes(req.body.priority)) {
      updates.priority = req.body.priority;
    }
    if (req.body.assignedTo !== undefined) updates.assignedTo = req.body.assignedTo;

    if (req.body.comment) {
      const commentText = sanitizeString(req.body.comment, 500);
      task.comments.push({
        author: req.user._id,
        authorName: req.user.name || 'Officer',
        text: commentText,
        at: new Date()
      });
    }

    Object.assign(task, updates);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('beneficiary', 'name phone district')
      .populate('createdBy', 'name role')
      .populate('comments.author', 'name role');

    return res.json({ task: updatedTask });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role === 'officer' && task.district && req.user.district && task.district.toLowerCase() !== req.user.district.toLowerCase()) {
      return res.status(403).json({ error: 'Officer access restricted to assigned district' });
    }

    await Task.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

// POST /api/tasks/:id/comments
router.post('/:id/comments', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const text = sanitizeString(req.body.text || req.body.comment, 500);
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    task.comments.push({
      author: req.user._id,
      authorName: req.user.name || 'Officer',
      text,
      at: new Date()
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('beneficiary', 'name phone district')
      .populate('createdBy', 'name role')
      .populate('comments.author', 'name role');

    return res.status(201).json({ task: updatedTask });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add comment' });
  }
});

// PATCH /api/tasks/:id/comments/:commentId
router.patch('/:id/comments/:commentId', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const authorId = comment.author?._id || comment.author;
    const isAuthor = authorId && authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    const text = sanitizeString(req.body.text, 500);
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    comment.text = text;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('beneficiary', 'name phone district')
      .populate('createdBy', 'name role')
      .populate('comments.author', 'name role');

    return res.json({ task: updatedTask, comment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update comment' });
  }
});

// DELETE /api/tasks/:id/comments/:commentId
router.delete('/:id/comments/:commentId', authenticate, requireRole('officer', 'admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const authorId = comment.author?._id || comment.author;
    const isAuthor = authorId && authorId.toString() === req.user._id.toString();
    const isAdminOrOfficer = ['admin', 'officer'].includes(req.user.role);

    if (!isAuthor && !isAdminOrOfficer) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    task.comments.pull({ _id: req.params.commentId });
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('beneficiary', 'name phone district')
      .populate('createdBy', 'name role')
      .populate('comments.author', 'name role');

    return res.json({ task: updatedTask, message: 'Comment deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
