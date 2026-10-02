import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    names: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
      te: { type: String, required: true, trim: true }
    },
    aliases: [{ type: String, trim: true, lowercase: true }],
    level: { type: Number, default: 1, min: 1, max: 8 },
    sector: { type: String, required: true, trim: true, index: true },
    prerequisites: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

export const Skill = mongoose.model('Skill', skillSchema);
