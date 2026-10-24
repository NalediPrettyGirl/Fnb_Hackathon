const router = require('express').Router();
const controller = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');
router.get('/', requireAuth, controller.get);
module.exports = router;
