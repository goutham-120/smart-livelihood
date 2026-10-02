import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    district: { type: String, required: true, trim: true, index: true },
    courseKey: { type: String, required: true, trim: true, index: true },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'placed', 'dropped'],
      default: 'enrolled',
      required: true,
      index: true
    },
    employer: { type: String, trim: true },
    wage: { type: Number, default: 0 },
    at: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    isSynthetic: { type: Boolean, default: false }
  },
  { timestamps: true }
);

placementSchema.index({ district: 1, status: 1 });
placementSchema.index({ user: 1, courseKey: 1 });

export const Placement = mongoose.model('Placement', placementSchema);
