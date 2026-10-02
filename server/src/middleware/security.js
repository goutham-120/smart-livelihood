import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' }
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // max 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Please slow down.' }
});

export const channelLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => {
    const phone = req.body && req.body.From ? String(req.body.From) : req.ip;
    return phone;
  },
  message: { error: 'Channel rate limit exceeded. Please wait a moment.' }
});

export const sanitizeString = (val, maxLen = 256) => {
  if (val === undefined || val === null) return '';
  return String(val).trim().slice(0, maxLen);
};

export const sanitizeNumber = (val, fallback = 0) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
};

export const sanitizeBoolean = (val, fallback = false) => {
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === 1 || val === '1') return true;
  if (val === 'false' || val === 0 || val === '0') return false;
  return fallback;
};

export const sanitizeArray = (val, itemSanitizer = sanitizeString) => {
  if (!Array.isArray(val)) return [];
  return val.map(itemSanitizer).filter(Boolean);
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  // Generic safe client response
  const status = err.status || 500;
  return res.status(status).json({
    error: err.userMessage || 'An unexpected error occurred. Please try again.'
  });
};
