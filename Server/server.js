const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const PORT  = process.env.PORT || 3000;

// Import routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');
const redis = require('./config/redis');

const app = express();
connectDB()

const { cleanupPlayerScripts } = require('./services/youtubeService');
cleanupPlayerScripts();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    message: 'VideoAI API - Cleaned Up',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      auth: {
        'POST /api/auth/signup': 'Create account',
        'POST /api/auth/login': 'Login and return JWT',
        'GET /api/auth/me': 'Get current logged-in user'
      },
      upload: {
        'POST /api/upload/video': 'Upload video file (multipart/form-data)',
        'POST /api/upload/youtube': 'Upload YouTube video via URL',
        'GET /api/upload/status/:jobId': 'Get job status',
        'GET /api/upload/jobs': 'Get user jobs with pagination'
      }
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'VideoAI API - Cleaned Up',
    version: '2.0.0',
    status: 'running',
    api: '/api/info'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  
  // Clean up player-script files every 5 minutes
  setInterval(() => {
    cleanupPlayerScripts();
  }, 5 * 60 * 1000);
});

// module.exports = app;
