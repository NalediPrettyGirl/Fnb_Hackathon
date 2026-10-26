
const router = require('express').Router();

const controller = require('../controllers/applicationController');
const { requireAuth, allowRoles } = require('../middleware/auth');

// Freelancers can view their own applications.
router.get(
  '/me',
  requireAuth,
  allowRoles('freelancer'),
  controller.mine
);

// Clients can view applications for their own gigs.
// Ownership is checked in the service.
router.get(
  '/gig/:gigId',
  requireAuth,
  allowRoles('client'),
  controller.forGig
);

// Clients can accept or reject applications for their own gigs.
router.patch(
  '/:id/status',
  requireAuth,
  allowRoles('client'),
  controller.updateStatus
);

module.exports = router;

