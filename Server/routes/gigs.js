const router = require('express').Router();
const controller = require('../controllers/gigController');
const { requireAuth, allowRoles } = require('../middleware/auth');
router.get('/', controller.list);
router.post('/', requireAuth, allowRoles('client'), controller.create);
router.get('/:id', controller.getById);
router.post('/:id/apply', requireAuth, allowRoles('freelancer'), controller.apply);
module.exports = router;
