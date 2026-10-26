
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const pinoHttp = require('pino-http');

const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const gigRoutes = require('./routes/gigs');
const applicationRoutes = require('./routes/applications');
const simulationRoutes = require('./routes/simulations');
const dashboardRoutes = require('./routes/dashboard');
const portfolioRoutes = require('./routes/portfolio');
const guideRoutes = require('./routes/guides');
const skillMatchRoutes = require('./routes/skillMatch');

const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Create Express application
const app = express();

app.disable('x-powered-by');

// HTTP request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: req => req.url === '/api/health'
    },
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} completed with ${res.statusCode}`,
    customErrorMessage: (req, res, error) =>
      `${req.method} ${req.url} failed with ${res.statusCode}: ${error.message}`
  })
);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// CORS configuration
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  : null;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (!allowedOrigins) {
        if (process.env.NODE_ENV === 'production') {
          return callback(new Error('Origin not allowed by CORS.'));
        }

        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS.'));
    }
  })
);

// Parse JSON requests
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;

  return res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/skillmatch', skillMatchRoutes);

app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// API 404 handler
app.use('/api', (req, res) => {
  const requestLogger = req.log || logger;

  requestLogger.warn(
    {
      method: req.method,
      url: req.originalUrl
    },
    'API endpoint not found'
  );

  return res.status(404).json({
    success: false,
    message: 'API endpoint not found.'
  });
});

// Serve frontend
const clientPath = path.resolve(__dirname, '..', 'Client');

app.use(
  express.static(clientPath, {
    extensions: ['html']
  })
);

app.get('/', (_req, res, next) => {
  res.sendFile(path.join(clientPath, 'index.html'), error => {
    if (error) {
      next(error);
    }
  });
});

// Central error handler
app.use(errorHandler);

// Export without starting the server
module.exports = app;
