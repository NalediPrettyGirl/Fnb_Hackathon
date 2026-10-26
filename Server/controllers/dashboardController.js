
const dashboardService = require('../services/dashboardService');

/**
 * GET /api/dashboard
 *
 * Returns dashboard data for the authenticated user based on their role.
 */
exports.get = async (req, res, next) => {
  const logger = req.log;

  try {
    logger?.info(
      {
        userId: req.user?._id ? String(req.user._id) : undefined,
        role: req.user?.role
      },
      'Dashboard request received'
    );

    const dashboard = await dashboardService.getDashboard(
      req.user,
      logger
    );

    return res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger?.error(
      {
        err: error,
        userId: req.user?._id ? String(req.user._id) : undefined
      },
      'Dashboard request failed'
    );

    return next(error);
  }
};
