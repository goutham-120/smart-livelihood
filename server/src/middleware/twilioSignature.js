import twilio from 'twilio';

export const verifyTwilioSignature = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return res.status(403).json({ error: 'Webhook configuration missing' });
  }

  const signature = req.headers['x-twilio-signature'];
  if (!signature) {
    return res.status(403).json({ error: 'Invalid webhook signature' });
  }

  const baseUrl = process.env.PUBLIC_BASE_URL || `http://${req.headers.host}`;
  const url = `${baseUrl}${req.originalUrl}`;
  const params = req.body || {};

  const isValid = twilio.validateRequest(authToken, signature, url, params);
  if (!isValid) {
    return res.status(403).json({ error: 'Signature verification failed' });
  }

  next();
};
