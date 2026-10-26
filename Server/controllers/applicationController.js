
const applicationService = require('../services/applicationService');

function handleError(req, next, error, operation) {
  req.log?.error({
    err: error,
    operation,
    userId: req.user?._id
      ? String(req.user._id)
      : undefined
  }, 'Application request failed');

  next(error);
}

exports.mine = async (req, res, next) => {
  try {
    const result = await applicationService.listMyApplications(
      req.user._id,
      req.log
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleError(req, next, error, 'list_my_applications');
  }
};

exports.forGig = async (req, res, next) => {
  try {
    const result = await applicationService.listApplicationsForGig(
      req.params.gigId,
      req.user._id,
      req.log
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleError(req, next, error, 'list_gig_applications');
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const application = await applicationService.updateStatus(
      req.params.id,
      req.body?.status,
      req.user._id,
      req.log
    );

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully.',
      data: { application }
    });
  } catch (error) {
    return handleError(req, next, error, 'update_application_status');
  }
};
