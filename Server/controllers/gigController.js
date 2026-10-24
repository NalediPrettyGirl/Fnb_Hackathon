const gigService = require('../services/gigService');
exports.list = async (req, res, next) => { try { res.json(await gigService.listGigs(req.query)); } catch (e) { next(e); } };
exports.getById = async (req, res, next) => { try { res.json({ gig: await gigService.getGig(req.params.id) }); } catch (e) { next(e); } };
exports.create = async (req, res, next) => { try { const gig = await gigService.createGig(req.body, req.user._id); res.status(201).json({ message: 'Gig posted successfully.', gig }); } catch (e) { next(e); } };
exports.apply = async (req, res, next) => {
  try { const application = await gigService.applyToGig(req.params.id, req.user._id, req.body?.coverNote || ''); res.status(201).json({ message: 'Application submitted.', application }); }
  catch (e) { if (e.code === 11000) e.status = 409; next(e); }
};
