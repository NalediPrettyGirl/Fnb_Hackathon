
const logger = require('../config/logger');

function errorHandler(error, req, res, next) {
  // Headers may already have been sent by the route.
  if (res.headersSent) {
    return next(error);
  }

  const status =
    error.code === 11000
      ? 409
      : error.name === 'ValidationError'
        ? 400
        : error.name === 'CastError'
          ? 400
          : error.type === 'entity.parse.failed'
            ? 400
            : Number.isInteger(error.status) &&
                error.status >= 400 &&
                error.status < 500
              ? error.status
              : 500;

  // Log internal details for debugging. Do not expose stack traces
  // or database details to the client.
  const requestLogger = req.log || logger;

  requestLogger.error(
    {
      err: error,
      status,
      method: req.method,
      url: req.originalUrl,
      mongoCode: error.code || undefined
    },
    'Request error'
  );

  // Handle MongoDB duplicate-key errors.
  if (error.code === 11000) {
    const duplicateFields = Object.keys(error.keyPattern || {});

    const isDuplicateApplication =
      duplicateFields.includes('gigId') &&
      duplicateFields.includes('userId');

    return res.status(409).json({
      success: false,
      message: isDuplicateApplication
        ? 'You have already applied for this gig.'
        : 'A record with these details already exists.'
    });
  }

  // Handle Mongoose schema validation errors.
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      details: Object.values(error.errors || {}).map(
        item => item.message
      )
    });
  }

  // Handle invalid MongoDB ObjectIds.
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID or data format.'
    });
  }

  // Handle malformed JSON request bodies.
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body.'
    });
  }

  // Return safe messages for expected client errors.
  if (status < 500) {
    return res.status(status).json({
      success: false,
      message: error.expose === false
        ? 'The request could not be completed.'
        : error.message || 'The request could not be completed.'
    });
  }

  // Never expose internal exception details to the client.
  return res.status(500).json({
    success: false,
    message: 'Unexpected server error.'
  });
}

module.exports = errorHandler;
