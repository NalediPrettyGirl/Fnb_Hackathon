const simulationService = require('../services/simulationService');
exports.list = async (_req, res, next) => { try { res.json(await simulationService.listSimulations()); } catch (e) { next(e); } };
exports.submit = async (req, res, next) => {
  try { const result = await simulationService.submitAnswer(req.params.id, req.user._id, req.body?.answer); res.status(201).json({ message: 'Simulation completed. XP awarded!', ...result }); }
  catch (e) { if (e.code === 11000) e.status = 409; next(e); }
};
exports.portfolio = async (req, res, next) => { try { res.json(await simulationService.getMyPortfolio(req.user._id)); } catch (e) { next(e); } };
