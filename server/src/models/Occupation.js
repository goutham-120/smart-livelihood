import mongoose from 'mongoose';

const occupationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    titles: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
      te: { type: String, required: true, trim: true }
    },
    sector: { type: String, required: true, trim: true, index: true },
    nsqfLevel: { type: Number, required: true, min: 1, max: 10 },
    ncoCode: { type: String, trim: true },
    incomeMin: { type: Number, required: true },
    incomeMax: { type: Number, required: true },
    workModes: [{ type: String, enum: ['home', 'field', 'workshop', 'office', 'store', 'factory'] }],
    travelRequired: { type: Boolean, default: false },
    minEducation: { type: String, default: 'Primary School' },
    selfEmploymentViable: { type: Boolean, default: true },
    requiredSkills: [{ type: String, trim: true }],
    source: { type: String, default: null }
  },
  { timestamps: true }
);

occupationSchema.index({ sector: 1, nsqfLevel: 1 });
occupationSchema.index({ selfEmploymentViable: 1 });

export const Occupation = mongoose.model('Occupation', occupationSchema);
