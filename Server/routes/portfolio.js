const router = require('express').Router();
const controller = require('../controllers/simulationController');
const { requireAuth } = require('../middleware/auth');
router.get('/me', requireAuth, controller.portfolio);
module.exports = router;
