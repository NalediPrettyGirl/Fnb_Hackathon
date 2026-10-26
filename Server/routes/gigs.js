
const router = require('express').Router();

const controller = require('../controllers/gigController');
const {
  requireAuth,
  allowRoles
} = require('../middleware/auth');

// Public: browse and search gigs.
router.get('/', controller.list);

// Public: view a gig's details.
router.get('/:id', controller.getById);

// Clients: create a gig.
router.post(
  '/',
  requireAuth,
  allowRoles('client'),
  controller.create
);

// Clients: update their own gig.
router.patch(
  '/:id',
  requireAuth,
  allowRoles('client'),
  controller.update
);

// Clients: open or close their own gig.
router.patch(
  '/:id/status',
  requireAuth,
  allowRoles('client'),
  controller.updateStatus
);

// Clients: delete their own gig if no applications exist.
router.delete(
  '/:id',
  requireAuth,
  allowRoles('client'),
  controller.remove
);

// Freelancers: apply to an open gig.
router.post(
  '/:id/apply',
  requireAuth,
  allowRoles('freelancer'),
  controller.apply
);

module.exports = router;
