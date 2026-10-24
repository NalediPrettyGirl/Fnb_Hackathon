const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Gig = require('../models/Gig');
const { requireAuth, allowRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user._id }).populate({ path: 'gigId', select: 'title budget skills status postedBy', populate: { path: 'postedBy', select: 'name' } }).sort({ createdAt: -1 });
    res.json({ count: applications.length, applications });
  } catch (error) { next(error); }
});

// Client-only review endpoint: POST /api/applications/:id/status {"status":"accepted"|"rejected"}
router.patch('/:id/status', requireAuth, allowRoles('client'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid application id.' });
    if (!['accepted', 'rejected'].includes(req.body?.status)) return res.status(400).json({ message: 'Status must be accepted or rejected.' });
    const application = await Application.findById(req.params.id).populate('gigId');
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    if (!application.gigId || String(application.gigId.postedBy) !== String(req.user._id)) return res.status(403).json({ message: 'You can only review applications to your own gigs.' });
    application.status = req.body.status;
    await application.save();
    res.json({ message: 'Application status updated.', application });
  } catch (error) { next(error); }
});
module.exports = router;
