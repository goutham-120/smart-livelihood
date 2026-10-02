import mongoose from 'mongoose';

const journeySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    currentStage: {
      type: String,
      enum: ['discovery', 'skill_assessment', 'training_enrolled', 'certified', 'livelihood_matched', 'placed', 'self_employed'],
      default: 'discovery'
    },
    targetOccupation: { type: String, trim: true },
    enrolledCourse: { type: String, trim: true },
    milestones: [
      {
        name: { type: String, required: true },
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        completedAt: { type: Date }
      }
    ],
    notes: [{ text: { type: String }, at: { type: Date, default: Date.now } }]
  },
  { timestamps: true }
);

export const Journey = mongoose.model('Journey', journeySchema);
