import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({ actor, actorRole, action, target, targetModel, district, details = {} }) => {
  try {
    if (!actor) return;
    await AuditLog.create({
      actor,
      actorRole: actorRole || 'unknown',
      action,
      target,
      targetModel: targetModel || 'User',
      district: district || null,
      details,
      at: new Date()
    });
  } catch (err) {
    // Non-blocking error handling for audit logs
  }
};
