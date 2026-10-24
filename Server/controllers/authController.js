const authService = require('../services/authService');
exports.register = async (req, res, next) => {
  try { const result = await authService.register(req.body || {}); res.status(201).json({ message: 'Account created successfully.', ...result }); }
  catch (error) { if (error.code === 11000) error.status = 409; next(error); }
};
exports.login = async (req, res, next) => {
  try { const result = await authService.login(req.body || {}); res.json({ message: 'Login successful.', ...result }); }
  catch (error) { next(error); }
};
