const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const controller = require('../controllers/adminController');
router.use(requireAuth, requireAdmin);
router.get('/overview', controller.overview);
router.get('/users', controller.users);
router.patch('/users/:id/role', controller.updateRole);
module.exports = router;
