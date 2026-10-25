
const skillMatchService = require('../services/skillMatchService');

// Handles authenticated requests for the current freelancer's matches.
exports.mine = async (req, res, next) => {
  try {
    req.log?.info(
      { userId: String(req.user._id) },
      'SkillMatch request received'
    );

    const result = await skillMatchService.getMatches(
      req.user._id,
      req.log
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    req.log?.error(
      {
        err: error,
        userId: String(req.user?._id || '')
      },
      'Failed to generate SkillMatch recommendations'
    );

    return next(error);
  }
};
