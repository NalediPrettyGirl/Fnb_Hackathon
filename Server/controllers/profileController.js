
const profileService = require('../services/profileService');

exports.getMe = async (req, res, next) => {
  try {
    const user = await profileService.getMyProfile(req.user._id);

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Get profile failed');
    return next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const user = await profileService.updateMyProfile(
      req.user._id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user }
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Update profile failed');
    return next(error);
  }
};
