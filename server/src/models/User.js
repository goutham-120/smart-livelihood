import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ['beneficiary', 'officer', 'admin'],
      default: 'beneficiary',
      required: true,
      index: true
    },
    org: {
      type: String,
      enum: ['corporation', 'department', 'ministry', 'training_partner', null],
      default: null
    },
    district: { type: String, trim: true, index: true },
    consent: {
      given: { type: Boolean, default: false },
      at: { type: Date },
      version: { type: String, default: '1.0' },
      language: { type: String, default: 'en' }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isSynthetic: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.index({ district: 1, role: 1 });

export const User = mongoose.model('User', userSchema);
