import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { apiLimiter, errorHandler } from './middleware/security.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import privacyRoutes from './routes/privacy.js';
import officerRoutes from './routes/officer.js';
import adminRoutes from './routes/admin.js';
import directoryRoutes from './routes/directory.js';
import placementsRoutes from './routes/placements.js';
import jobsRoutes from './routes/jobs.js';
import tasksRoutes from './routes/tasks.js';
import assistantRoutes from './routes/assistant.js';
import opportunitiesRoutes from './routes/opportunities.js';
import pathwayRoutes from './routes/pathway.js';
import channelsRoutes from './routes/channels.js';
import plansRoutes from './routes/plans.js';
import analyticsRoutes from './routes/analytics.js';
import enrollmentsRoutes from './routes/enrollments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Production check: Refuse to start without JWT_SECRET
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'paste_a_long_random_string_here')) {
  console.error('FATAL ERROR: JWT_SECRET environment variable must be set in production mode.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/livelihood';

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS allowlist configuration
const rawCorsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173';
const allowedOrigins = rawCorsOrigin.split(',').map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, twilio webhooks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true
  })
);

// Request Size Limits & Parsing
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Global API Rate Limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'SIH26097 PM-AJAY AI Voice Livelihood Assistant',
    speechProvider: process.env.SPEECH_PROVIDER || 'webspeech'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/consent', privacyRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/placements', placementsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/self-employment', opportunitiesRoutes);
app.use('/api/pathway', pathwayRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/enrollments', enrollmentsRoutes);

// Safe Error Handler
app.use(errorHandler);

import { syncCatalogData } from './services/catalogSync.js';

// Database connection and startup
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI.includes('@') ? 'MongoDB Atlas' : MONGO_URI}`);
    await syncCatalogData();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Livelihood Assistant Server listening on port ${PORT}`);
    });
  });
}

export default app;
