const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/profileController');
router.get('/me', requireAuth, controller.getMe);
router.patch('/me', requireAuth, controller.updateMe);
module.exports = router;
