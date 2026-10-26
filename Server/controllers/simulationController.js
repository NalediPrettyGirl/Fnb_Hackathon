
const simulationService = require('../services/simulationService');

function handleError(req, next, error, operation) {
  req.log?.error({
    err: error,
    operation,
    userId: req.user?._id ? String(req.user._id) : undefined,
    simulationId: req.params?.id
  }, 'Simulation request failed');

  next(error);
}

exports.list = async (req, res, next) => {
  try {
    const data = await simulationService.listSimulations(
      req.query,
      req.log
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    return handleError(req, next, error, 'list_simulations');
  }
};

exports.getById = async (req, res, next) => {
  try {
    const simulation = await simulationService.getSimulationById(
      req.params.id,
      req.log
    );

    return res.status(200).json({
      success: true,
      data: { simulation }
    });
  } catch (error) {
    return handleError(req, next, error, 'get_simulation');
  }
};

exports.submit = async (req, res, next) => {
  try {
    const result = await simulationService.submitSimulation(
      req.user._id,
      req.params.id,
      req.body?.answer,
      req.log
    );

    return res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    return handleError(req, next, error, 'submit_simulation');
  }
};

exports.portfolio = async (req, res, next) => {
  try {
    const data = await simulationService.getMyPortfolio(
      req.user._id,
      req.log
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    return handleError(req, next, error, 'get_portfolio');
  }
};
