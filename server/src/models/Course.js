import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    nsqfLevel: { type: Number, required: true, min: 1, max: 10 },
    qpCode: { type: String, required: true, trim: true, index: true },
    mode: { type: String, enum: ['offline', 'online', 'hybrid'], default: 'offline' },
    costInr: { type: Number, default: 0 },
    language: { type: String, default: 'en' },
    durationMonths: { type: Number, required: true },
    skillsGained: [{ type: String, trim: true }],
    source: { type: String, default: null }
  },
  { timestamps: true }
);

courseSchema.index({ nsqfLevel: 1, qpCode: 1 });

export const Course = mongoose.model('Course', courseSchema);
