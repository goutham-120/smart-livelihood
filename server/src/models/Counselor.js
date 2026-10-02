import mongoose from 'mongoose';

const counselorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true, index: true },
    state: { type: String, default: 'Telangana', trim: true },
    languages: [{ type: String, trim: true }],
    contact: { type: String, required: true, trim: true },
    specialization: [{ type: String, trim: true }],
    verified: { type: Boolean, default: true },
    isSynthetic: { type: Boolean, default: true }
  },
  { timestamps: true }
);

counselorSchema.index({ district: 1, languages: 1 });

export const Counselor = mongoose.model('Counselor', counselorSchema);
