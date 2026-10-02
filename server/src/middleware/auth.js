import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Internal configuration error' });
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied for this role' });
    }
    next();
  };
};

export const requireDistrictAccess = (districtGetter) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role === 'admin') {
      return next();
    }
    const targetDistrict = typeof districtGetter === 'function' ? districtGetter(req) : req.query.district || req.body.district || req.params.district;
    if (req.user.role === 'officer') {
      if (!req.user.district || (targetDistrict && String(targetDistrict).toLowerCase() !== String(req.user.district).toLowerCase())) {
        return res.status(403).json({ error: 'Officers may only access records within their assigned district' });
      }
    }
    next();
  };
};
