
const router = require('express').Router();
const controller = require('../controllers/applicationController');
const { requireAuth, allowRoles } = require('../middleware/auth');

router.get('/me', requireAuth, controller.mine);

router.patch(
  '/:id/status',
  requireAuth,
  allowRoles('client'),
  controller.updateStatus
);

module.exports = router;
