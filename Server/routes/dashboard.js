const express = require('express');
const Application = require('../models/Application');
const Submission = require('../models/Submission');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [completedTasks, applicationCounts] = await Promise.all([
      Submission.countDocuments({ userId: req.user._id }),
      Application.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);
    const applications = { total: 0, pending: 0, accepted: 0, rejected: 0 };
    for (const row of applicationCounts) { applications[row._id] = row.count; applications.total += row.count; }
    res.json({ user: { id: req.user._id, name: req.user.name, role: req.user.role }, xp: req.user.xp, completedTasks, applications });
  } catch (error) { next(error); }
});
module.exports = router;
