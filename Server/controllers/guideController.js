
const guideService = require('../services/guideService');

exports.list = async (req, res, next) => {
  try {
    const result = await guideService.listGuides(req.query);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    req.log?.error({ err: error }, 'List guides failed');
    return next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const guide = await guideService.getGuide(req.params.id);

    return res.status(200).json({
      success: true,
      data: { guide }
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Get guide failed');
    return next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const guide = await guideService.createGuide(
      req.user,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: 'Guide created successfully.',
      data: { guide }
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Create guide failed');
    return next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const guide = await guideService.updateGuide(
      req.params.id,
      req.user,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Guide updated successfully.',
      data: { guide }
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Update guide failed');
    return next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await guideService.deleteGuide(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Guide deleted successfully.'
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Delete guide failed');
    return next(error);
  }
};
