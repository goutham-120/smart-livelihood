import mongoose from 'mongoose';

const jobOpeningSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    employer: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true, index: true },
    occupationKey: { type: String, required: true, trim: true, index: true },
    wage: { type: Number, required: true },
    openings: { type: Number, default: 1, min: 1 },
    status: {
      type: String,
      enum: ['open', 'closed', 'paused'],
      default: 'open',
      index: true
    },
    requiredSkills: [{ type: String, trim: true }],
    contact: { type: String, trim: true },
    isSynthetic: { type: Boolean, default: true }
  },
  { timestamps: true }
);

jobOpeningSchema.index({ district: 1, status: 1 });
jobOpeningSchema.index({ occupationKey: 1, status: 1 });

export const JobOpening = mongoose.model('JobOpening', jobOpeningSchema);
