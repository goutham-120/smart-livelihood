import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    language: { type: String, default: 'en', trim: true },
    dialect: { type: String, trim: true },
    state: { type: String, default: 'Telangana', trim: true },
    district: { type: String, required: true, trim: true, index: true },
    block: { type: String, trim: true },
    village: { type: String, trim: true },
    familyOccupation: { type: String, trim: true },
    currentLivelihood: { type: String, trim: true },
    employmentPreference: {
      type: String,
      enum: ['self', 'wage', 'either'],
      default: 'either'
    },
    mobilityConstraints: [{ type: String, trim: true }],
    incomeGoal: { type: Number, default: 15000 },
    weeklyHours: { type: Number, default: 40 },
    channel: {
      type: String,
      enum: ['web', 'kiosk', 'whatsapp', 'ivr'],
      default: 'web'
    },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskReasons: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    education: { type: String, default: 'Middle School', trim: true },
    experienceYears: { type: Number, default: 0 },
    isSynthetic: { type: Boolean, default: false }
  },
  { timestamps: true }
);

profileSchema.index({ district: 1, employmentPreference: 1 });
profileSchema.index({ riskScore: -1 });

export const Profile = mongoose.model('Profile', profileSchema);
