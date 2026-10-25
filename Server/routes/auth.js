
const router = require('express').Router();

const controller = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', requireAuth, controller.logout);

module.exports = router;
