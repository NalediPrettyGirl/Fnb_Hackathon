const express = require('express');
const Submission = require('../models/Submission');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const projects = await Submission.find({ userId: req.user._id }).populate('simulationId', 'title brief skillTrack xpReward').sort({ completedAt: -1 });
    res.json({ count: projects.length, projects });
  } catch (error) { next(error); }
});
module.exports = router;
