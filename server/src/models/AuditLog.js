import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorRole: { type: String, trim: true },
    action: { type: String, required: true, trim: true, index: true },
    target: { type: mongoose.Schema.Types.ObjectId, index: true },
    targetModel: { type: String, trim: true },
    district: { type: String, trim: true, index: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    at: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

auditLogSchema.index({ district: 1, at: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
