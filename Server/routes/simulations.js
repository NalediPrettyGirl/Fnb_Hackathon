
const router = require('express').Router();
const controller = require('../controllers/simulationController');
const { requireAuth, allowRoles } = require('../middleware/auth');

router.get('/', controller.list);
router.get('/:id', controller.getById);

router.post(
  '/:id/submit',
  requireAuth,
  allowRoles('freelancer'),
  controller.submit
);

module.exports = router;
