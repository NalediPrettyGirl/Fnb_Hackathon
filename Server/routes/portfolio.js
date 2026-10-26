
const router = require('express').Router();
const controller = require('../controllers/simulationController');
const { requireAuth, allowRoles } = require('../middleware/auth');

router.get(
  '/me',
  requireAuth,
  allowRoles('freelancer'),
  controller.portfolio
);

module.exports = router;
