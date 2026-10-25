const router = require('express').Router();
const { requireAuth, allowRoles } = require('../middleware/auth');
const controller = require('../controllers/analyticsController');
router.get('/me', requireAuth, allowRoles('freelancer'), controller.mine);
module.exports = router;
