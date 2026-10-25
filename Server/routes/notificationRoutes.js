const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/notificationController');
router.get('/me', requireAuth, controller.mine);
router.patch('/read-all', requireAuth, controller.markAllRead);
router.patch('/:id/read', requireAuth, controller.markRead);
module.exports = router;
