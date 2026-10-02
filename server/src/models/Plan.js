import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    district: { type: String, required: true, trim: true, index: true },
    targetBeneficiaries: { type: Number, required: true },
    budgetInr: { type: Number, required: true },
    allocations: [
      {
        sector: { type: String, required: true },
        occupationKey: { type: String, required: true },
        beneficiaryCount: { type: Number, required: true },
        allocatedBudgetInr: { type: Number, required: true },
        expectedPlacements: { type: Number, required: true },
        trainingPartners: [{ type: String }]
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'approved', 'in_progress', 'completed'],
      default: 'draft'
    },
    projectedImpact: {
      avgMonthlyIncomeInr: { type: Number, default: 0 },
      overallPlacementRatePct: { type: Number, default: 0 },
      selfEmploymentCount: { type: Number, default: 0 },
      wageEmploymentCount: { type: Number, default: 0 }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

planSchema.index({ district: 1, createdAt: -1 });

export const Plan = mongoose.model('Plan', planSchema);
