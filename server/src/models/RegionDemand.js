import mongoose from 'mongoose';

const regionDemandSchema = new mongoose.Schema(
  {
    district: { type: String, required: true, trim: true, index: true },
    state: { type: String, default: 'Telangana', trim: true },
    occupationKey: { type: String, required: true, trim: true, index: true },
    demandLevel: { type: Number, required: true, min: 1, max: 5 },
    openings: { type: Number, default: 0 },
    avgIncome: { type: Number, default: 15000 },
    isSynthetic: { type: Boolean, default: true },
    source: { type: String, default: null }
  },
  { timestamps: true }
);

regionDemandSchema.index({ district: 1, occupationKey: 1 }, { unique: true });
regionDemandSchema.index({ district: 1, demandLevel: -1 });

export const RegionDemand = mongoose.model('RegionDemand', regionDemandSchema);
