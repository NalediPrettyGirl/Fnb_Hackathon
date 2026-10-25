
const router = require('express').Router();
const controller = require('../controllers/skillMatchController');
const { requireAuth, allowRoles } = require('../middleware/auth');

// Only authenticated freelancers can access their recommendations.
router.get(
  '/me',
  requireAuth,
  allowRoles('freelancer'),
  controller.mine
);

module.exports = router;
