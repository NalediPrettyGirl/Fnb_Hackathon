const express = require('express');
const mongoose = require('mongoose');
const Simulation = require('../models/Simulation');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { requireAuth, allowRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try { const simulations = await Simulation.find().sort({ createdAt: 1 }); res.json({ count: simulations.length, simulations }); }
  catch (error) { next(error); }
});

router.post('/:id/submit', requireAuth, allowRoles('freelancer'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid simulation id.' });
    const answer = typeof req.body?.answer === 'string' ? req.body.answer.trim() : '';
    if (answer.length < 5) return res.status(400).json({ message: 'Please provide an answer of at least 5 characters.' });
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) return res.status(404).json({ message: 'Simulation not found.' });
    const submission = await Submission.create({ userId: req.user._id, simulationId: simulation._id, answer, xpAwarded: simulation.xpReward });
    const user = await User.findByIdAndUpdate(req.user._id, { $inc: { xp: simulation.xpReward } }, { new: true }).select('_id name xp');
    res.status(201).json({ message: 'Simulation completed. XP awarded!', xpAwarded: simulation.xpReward, totalXp: user.xp, submission });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already completed this simulation. XP is awarded only once.' });
    next(error);
  }
});
module.exports = router;
