
const adminService = require('../services/adminService');

exports.overview = async (req, res, next) => {
  try {
    const overview = await adminService.getOverview();

    return res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Get admin overview failed');
    return next(error);
  }
};

exports.users = async (req, res, next) => {
  try {
    const result = await adminService.listUsers(req.query);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    req.log?.error({ err: error }, 'List admin users failed');
    return next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const user = await adminService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
      data: { user }
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Update user role failed');
    return next(error);
  }
};
