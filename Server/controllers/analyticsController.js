
const analyticsService = require('../services/analyticsService');

exports.mine = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getMyAnalytics(
      req.user._id
    );

    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Get analytics failed');
    return next(error);
  }
};
