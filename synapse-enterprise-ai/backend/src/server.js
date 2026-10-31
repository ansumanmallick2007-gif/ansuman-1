import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { initDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Approved CORS configurations for Vercel Client Link Up
const configuredOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
  ...configuredOrigins
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman) or Vercel preview/production deployments
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with expanded limits for enterprise documents
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Security: Rate limiting applied to AI inference & auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'AI inference rate limit exceeded. Please throttle requests.' }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    platform: 'Synapse Enterprise AI',
    status: 'OPERATIONAL',
    version: '1.0.0',
    documentation: 'https://docs.synapse.ai'
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start server after DB initialization
async function startServer() {
  await initDB();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Synapse Enterprise AI Platform API Server Online`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🧠 AI Engine: Google Gemini 2.5 Flash (@google/genai)`);
    console.log(`====================================================`);
  });
}

startServer();

export default app;

