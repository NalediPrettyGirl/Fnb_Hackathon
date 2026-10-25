
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const logger = require('./config/logger');
const pinoHttp = require('pino-http');

const connectDatabase = require('./config/database');

const authRoutes = require('./routes/auth');
const gigRoutes = require('./routes/gigs');
const applicationRoutes = require('./routes/applications');
const simulationRoutes = require('./routes/simulations');
const dashboardRoutes = require('./routes/dashboard');
const portfolioRoutes = require('./routes/portfolio');
const guideRoutes = require('./routes/guides');


// --------------------------------------------------
// Environment validation
// --------------------------------------------------

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  logger.fatal(
    'JWT_SECRET must be configured and contain at least 32 characters.'
  );
  process.exit(1);
}

// --------------------------------------------------
// Express application
// --------------------------------------------------

const app = express();

app.disable('x-powered-by');

// Log HTTP requests, response status and duration.
// Do not log request bodies or authentication tokens.
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/api/health'
    },
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} completed with ${res.statusCode}`,
    customErrorMessage: (req, res, error) =>
      `${req.method} ${req.url} failed: ${error.message}`
  })
);

app.use(helmet({ contentSecurityPolicy: false }));

const origins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(value => value.trim())
  : true;

app.use(cors({ origin: origins }));

app.use(express.json({ limit: '1mb' }));

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: 'ok',
    database: connected ? 'connected' : 'disconnected'
  });
});

// --------------------------------------------------
// API routes
// --------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/skillmatch', require('./routes/skillMatch'));

// Handle unknown API endpoints.
app.use('/api', (req, res) => {
  req.log.warn(
    { method: req.method, url: req.originalUrl },
    'API endpoint not found'
  );

  res.status(404).json({
    message: 'API endpoint not found.'
  });
});

// --------------------------------------------------
// Serve frontend
// --------------------------------------------------

const clientPath = path.join(__dirname, '..', 'Client');

app.use(express.static(clientPath, { extensions: ['html'] }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// --------------------------------------------------
// Central error handler
// Keep this after all routes and middleware.
// --------------------------------------------------

app.use((error, req, res, _next) => {
  const status =
    error.code === 11000 ? 409 :
    error.name === 'ValidationError' ? 400 :
    error.name === 'CastError' ? 400 :
    Number.isInteger(error.status) && error.status < 500
      ? error.status
      : 500;

  // Log the full error internally, not to the client.
  req.log.error(
    {
      err: error,
      status,
      method: req.method,
      url: req.originalUrl,
      mongoCode: error.code || undefined
    },
    'Request error'
  );

  if (res.headersSent) {
    return;
  }

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {});

    const isDuplicateApplication =
      duplicateField.includes('gigId') &&
      duplicateField.includes('userId');

    return res.status(409).json({
      message: isDuplicateApplication
        ? 'You have already applied for this gig.'
        : 'A record with these details already exists.'
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed.',
      details: Object.values(error.errors).map(item => item.message)
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID or data format.'
    });
  }

  if (status < 500) {
    return res.status(status).json({
      message: error.message || 'The request could not be completed.'
    });
  }

  return res.status(500).json({
    message: 'Unexpected server error.'
  });
});

// --------------------------------------------------
// MongoDB connection lifecycle logging
// --------------------------------------------------

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', error => {
  logger.error({ err: error }, 'MongoDB connection error');
});

// --------------------------------------------------
// Start server and handle shutdown
// --------------------------------------------------

const PORT = Number(process.env.PORT) || 5000;

let server;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(PORT, () => {
      logger.info(
        {
          port: PORT,
          database: mongoose.connection.name,
          environment: process.env.NODE_ENV || 'development',
          frontend: clientPath
        },
        'SkillBridge server started'
      );
    });

    server.on('error', error => {
      logger.fatal({ err: error }, 'HTTP server error');
      process.exitCode = 1;
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Could not connect to MongoDB');
    process.exitCode = 1;
  }
}

function shutdown(signal) {
  logger.info({ signal }, 'Server shutdown requested');

  if (!server) {
    mongoose.disconnect()
      .catch(error => logger.error({ err: error }, 'MongoDB shutdown error'))
      .finally(() => process.exit(0));
    return;
  }

  server.close(async error => {
    if (error) {
      logger.error({ err: error }, 'HTTP server shutdown error');
      process.exitCode = 1;
    }

    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed');
    } catch (dbError) {
      logger.error({ err: dbError }, 'MongoDB shutdown error');
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

startServer();
