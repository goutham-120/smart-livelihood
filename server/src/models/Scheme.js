import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['loan', 'training', 'subsidy', 'composite'],
      required: true,
      index: true
    },
    eligibilitySummary: { type: String, required: true, trim: true },
    benefit: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    targetTrades: [{ type: String, trim: true }],
    source: { type: String, default: null }
  },
  { timestamps: true }
);

export const Scheme = mongoose.model('Scheme', schemeSchema);
