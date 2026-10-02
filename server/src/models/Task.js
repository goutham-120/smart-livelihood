import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, trim: true },
    text: { type: String, required: true, trim: true },
    at: { type: Date, default: Date.now }
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedOrg: {
      type: String,
      enum: ['corporation', 'department', 'ministry', 'training_partner'],
      required: true
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    district: { type: String, required: true, trim: true, index: true },
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'done'],
      default: 'open',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueAt: { type: Date },
    comments: [commentSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

taskSchema.index({ district: 1, status: 1 });
taskSchema.index({ assignedOrg: 1, status: 1 });

export const Task = mongoose.model('Task', taskSchema);
