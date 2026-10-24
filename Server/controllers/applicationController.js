const applicationService = require('../services/applicationService');
exports.mine = async (req, res, next) => { try { res.json(await applicationService.listMyApplications(req.user._id)); } catch (e) { next(e); } };
exports.updateStatus = async (req, res, next) => {
  try { const application = await applicationService.updateStatus(req.params.id, req.body?.status, req.user._id); res.json({ message: 'Application status updated.', application }); }
  catch (e) { next(e); }
};
