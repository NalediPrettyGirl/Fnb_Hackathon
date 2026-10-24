const dashboardService = require('../services/dashboardService');
exports.get = async (req, res, next) => { try { res.json(await dashboardService.getDashboard(req.user)); } catch (e) { next(e); } };
