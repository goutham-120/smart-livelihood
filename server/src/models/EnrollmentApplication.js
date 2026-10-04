import mongoose from 'mongoose';

const enrollmentApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    beneficiaryName: {
      type: String,
      required: true,
      trim: true
    },
    beneficiaryDistrict: {
      type: String,
      required: true,
      trim: true
    },
    beneficiaryPhone: {
      type: String,
      trim: true
    },
    beneficiaryEducation: {
      type: String,
      trim: true
    },
    beneficiarySkills: [{
      type: String,
      trim: true
    }],

    occupationKey: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    occupationTitle: {
      type: String,
      trim: true
    },
    courseKey: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    courseTitle: {
      type: String,
      required: true,
      trim: true
    },
    qpCode: {
      type: String,
      trim: true
    },
    nsqfLevel: {
      type: Number,
      default: 3
    },
    durationMonths: {
      type: Number,
      default: 3
    },

    trainingCenter: {
      id: { type: String, trim: true },
      name: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, default: 'Telangana', trim: true },
      contact: { type: String, trim: true },
      location: { type: String, trim: true }
    },

    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'ACTION_REQUIRED',
        'ACCEPTED',
        'REJECTED',
        'TRAINING_STARTED',
        'TRAINING_COMPLETED',
        'ASSESSMENT_PENDING',
        'CERTIFIED'
      ],
      default: 'SUBMITTED',
      index: true
    },

    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date
    },

    providerMessage: {
      type: String,
      trim: true
    },
    nextAction: {
      type: String,
      default: 'Wait for the training provider to review your application.',
      trim: true
    },

    documents: [
      {
        key: { type: String, required: true },
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ['provided', 'missing', 'not_required'],
          default: 'missing'
        },
        fileName: { type: String, trim: true },
        fileSize: { type: String, trim: true },
        uploadedAt: { type: Date },
        notes: { type: String, trim: true }
      }
    ],

    timeline: [
      {
        stage: { type: String, required: true },
        title: { type: String, required: true },
        status: {
          type: String,
          enum: ['completed', 'current', 'upcoming'],
          default: 'upcoming'
        },
        timestamp: { type: Date },
        notes: { type: String, trim: true }
      }
    ],

    orientationDate: {
      type: String,
      trim: true
    },
    orientationVenue: {
      type: String,
      trim: true
    },
    rejectionReason: {
      type: String,
      trim: true
    },

    isSynthetic: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

enrollmentApplicationSchema.index({ user: 1, courseKey: 1, status: 1 });
enrollmentApplicationSchema.index({ beneficiaryDistrict: 1, status: 1 });

export const EnrollmentApplication = mongoose.model('EnrollmentApplication', enrollmentApplicationSchema);
