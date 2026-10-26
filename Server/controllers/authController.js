
const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body || {});

    return res.status(201).json({
      message: 'Account created successfully.',
      ...result
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 409;
    }

    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body || {});

    return res.status(200).json({
      message: 'Login successful.',
      ...result
    });
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.auth);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
