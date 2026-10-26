
const gigService = require('../services/gigService');

function handleError(req, next, error, operation) {
  req.log?.error(
    {
      err: error,
      operation,
      userId: req.user?._id ? String(req.user._id) : undefined,
      gigId: req.params?.id
    },
    `Gig operation failed: ${operation}`
  );

  // Preserve the application's centralized error handling.
  return next(error);
}

// GET /api/gigs
exports.list = async (req, res, next) => {
  try {
    req.log?.info(
      { query: req.query },
      'Listing gigs'
    );

    const result = await gigService.listGigs(
      req.query,
      req.log
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleError(req, next, error, 'list');
  }
};

// GET /api/gigs/:id
exports.getById = async (req, res, next) => {
  try {
    const gig = await gigService.getGig(
      req.params.id,
      req.log
    );

    return res.status(200).json({
      success: true,
      gig
    });
  } catch (error) {
    return handleError(req, next, error, 'getById');
  }
};

// POST /api/gigs
exports.create = async (req, res, next) => {
  try {
    const gig = await gigService.createGig(
      req.body,
      req.user._id,
      req.log
    );

    return res.status(201).json({
      success: true,
      message: 'Gig posted successfully.',
      gig
    });
  } catch (error) {
    return handleError(req, next, error, 'create');
  }
};

// PATCH /api/gigs/:id
exports.update = async (req, res, next) => {
  try {
    const gig = await gigService.updateGig(
      req.params.id,
      req.body,
      req.user._id,
      req.log
    );

    return res.status(200).json({
      success: true,
      message: 'Gig updated successfully.',
      gig
    });
  } catch (error) {
    return handleError(req, next, error, 'update');
  }
};

// PATCH /api/gigs/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const gig = await gigService.updateGigStatus(
      req.params.id,
      req.body?.status,
      req.user._id,
      req.log
    );

    return res.status(200).json({
      success: true,
      message: `Gig ${gig.status} successfully.`,
      gig
    });
  } catch (error) {
    return handleError(req, next, error, 'updateStatus');
  }
};

// DELETE /api/gigs/:id
exports.remove = async (req, res, next) => {
  try {
    const result = await gigService.deleteGig(
      req.params.id,
      req.user._id,
      req.log
    );

    return res.status(200).json({
      success: true,
      message: 'Gig deleted successfully.',
      data: result
    });
  } catch (error) {
    return handleError(req, next, error, 'delete');
  }
};

// POST /api/gigs/:id/apply
exports.apply = async (req, res, next) => {
  try {
    const application = await gigService.applyToGig(
      req.params.id,
      req.user._id,
      req.body?.coverNote ?? '',
      req.log
    );

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application
    });
  } catch (error) {
    // MongoDB duplicate-key error from the unique application index.
    if (error.code === 11000) {
      error.status = 409;
      error.message = 'You have already applied to this gig.';
    }

    return handleError(req, next, error, 'apply');
  }
};
