
require('dotenv').config();

const mongoose = require('mongoose');
const path = require('path');

const app = require('./app');
const logger = require('./config/logger');
const connectDatabase = require('./config/database');

// Validate JWT secret before starting the server
if (
  typeof process.env.JWT_SECRET !== 'string' ||
  process.env.JWT_SECRET.length < 32
) {
  logger.fatal(
    'JWT_SECRET must be configured and contain at least 32 characters.'
  );

  process.exit(1);
}

// MongoDB lifecycle logging
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', error => {
  logger.error(
    { err: error },
    'MongoDB connection error'
  );
});

const PORT = Number(process.env.PORT) || 5000;
const clientPath = path.resolve(__dirname, '..', 'Client');

let server;
let isShuttingDown = false;

// Start MongoDB and the HTTP server
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
        { err: error },
        'HTTP server error'
      );

      process.exitCode = 1;
      shutdown('HTTP_SERVER_ERROR');
    });

    return server;
  } catch (error) {
    logger.fatal(
      { err: error },
      'Could not connect to MongoDB'
    );

    process.exitCode = 1;

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      logger.error(
        { err: disconnectError },
        'MongoDB cleanup after startup failure failed'
      );
    }

    throw error;
  }
}

// Graceful shutdown
function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logger.info(
    { signal },
    'Server shutdown requested'
  );

  if (!server) {
    mongoose.disconnect().catch(error => {
      logger.error(
        { err: error },
        'MongoDB shutdown error'
      );

      process.exitCode = 1;
    });

    return;
  }

  server.close(async error => {
    if (error) {
      logger.error(
        { err: error },
        'HTTP server shutdown error'
      );

      process.exitCode = 1;
    }

    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed');
    } catch (dbError) {
      logger.error(
        { err: dbError },
        'MongoDB shutdown error'
      );

      process.exitCode = 1;
    }
  });
}

// Only start automatically when running this file directly.
// Importing it in tests will not start another server.
if (require.main === module) {
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  startServer().catch(() => {
    // Startup errors have already been logged.
  });
}

module.exports = {
  app,
  startServer
};
