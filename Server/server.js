
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const pinoHttp = require('pino-http');

const logger = require('./config/logger');
const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// --------------------------------------------------
// Route imports
// --------------------------------------------------

const authRoutes = require('./routes/auth');
const gigRoutes = require('./routes/gigs');
const applicationRoutes = require('./routes/applications');
const simulationRoutes = require('./routes/simulations');
const dashboardRoutes = require('./routes/dashboard');
const portfolioRoutes = require('./routes/portfolio');
const guideRoutes = require('./routes/guides');
const skillMatchRoutes = require('./routes/skillMatch');

// Additional feature routes.
// Make sure these files exist and export Express routers.
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// --------------------------------------------------
// Environment validation
// --------------------------------------------------

if (
  typeof process.env.JWT_SECRET !== 'string' ||
  process.env.JWT_SECRET.length < 32
) {
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

// --------------------------------------------------
// HTTP request logging
// Do not log request bodies or authentication tokens.
// --------------------------------------------------

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

// --------------------------------------------------
// Security and request parsing
// --------------------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// Configure CLIENT_ORIGIN in .env with comma-separated origins.
// Example: CLIENT_ORIGIN=http://localhost:3000,http://localhost:5173
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  : null;

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as curl.
      if (!origin) {
        return callback(null, true);
      }

      // Require explicit origins in production.
      if (!allowedOrigins) {
        if (process.env.NODE_ENV === 'production') {
          return callback(new Error('Origin not allowed by CORS.'));
        }

        // Development convenience only.
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS.'));
    }
  })
);

app.use(
  express.json({
    limit: '1mb'
  })
);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;

  return res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
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
app.use('/api/skillmatch', skillMatchRoutes);

app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// --------------------------------------------------
// API 404 handler
// This must come after all API routes.
// --------------------------------------------------

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

// --------------------------------------------------
// Serve frontend
// --------------------------------------------------

const clientPath = path.resolve(__dirname, '..', 'Client');

app.use(
  express.static(clientPath, {
    extensions: ['html']
  })
);

app.get('/', (_req, res, next) => {
  res.sendFile(
    path.join(clientPath, 'index.html'),
    error => {
      if (error) {
        next(error);
      }
    }
  );
});

// --------------------------------------------------
// Central error handler
// Keep this after all routes and middleware.
// --------------------------------------------------

app.use(errorHandler);

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
  logger.error(
    {
      err: error
    },
    'MongoDB connection error'
  );
});

// --------------------------------------------------
// Start server and handle graceful shutdown
// --------------------------------------------------

const PORT = Number(process.env.PORT) || 5000;

let server;
let isShuttingDown = false;

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
      logger.fatal(
        {
          err: error
        },
        'HTTP server error'
      );

      process.exitCode = 1;
      shutdown('HTTP_SERVER_ERROR');
    });
  } catch (error) {
    logger.fatal(
      {
        err: error
      },
      'Could not connect to MongoDB'
    );

    process.exitCode = 1;

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      logger.error(
        {
          err: disconnectError
        },
        'MongoDB cleanup after startup failure failed'
      );
    }
  }
}

function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logger.info(
    {
      signal
    },
    'Server shutdown requested'
  );

  if (!server) {
    mongoose
      .disconnect()
      .catch(error => {
        logger.error(
          {
            err: error
          },
          'MongoDB shutdown error'
        );

        process.exitCode = 1;
      });

    return;
  }

  server.close(async error => {
    if (error) {
      logger.error(
        {
          err: error
        },
        'HTTP server shutdown error'
      );

      process.exitCode = 1;
    }

    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed');
    } catch (dbError) {
      logger.error(
        {
          err: dbError
        },
        'MongoDB shutdown error'
      );

      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

startServer();

module.exports = app;
