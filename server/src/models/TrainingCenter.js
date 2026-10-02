import mongoose from 'mongoose';

const trainingCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true, index: true },
    state: { type: String, default: 'Telangana', trim: true },
    trades: [{ type: String, trim: true }],
    nsqfLevels: [{ type: Number }],
    contact: { type: String, trim: true },
    geo: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    schemes: [{ type: String, trim: true }],
    source: { type: String, default: null }
  },
  { timestamps: true }
);

trainingCenterSchema.index({ district: 1, trades: 1 });

export const TrainingCenter = mongoose.model('TrainingCenter', trainingCenterSchema);
