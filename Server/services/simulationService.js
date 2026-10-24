const mongoose = require('mongoose');
const Simulation = require('../models/Simulation');
const Submission = require('../models/Submission');
const User = require('../models/User');

async function listSimulations() {
  const simulations = await Simulation.find().sort({ createdAt: 1 });
  return { count: simulations.length, simulations };
}
async function submitAnswer(simulationId, userId, answer) {
  if (!mongoose.isValidObjectId(simulationId)) { const e = new Error('Invalid simulation id.'); e.status = 400; throw e; }
  if (typeof answer !== 'string' || answer.trim().length < 5) { const e = new Error('Please provide an answer of at least 5 characters.'); e.status = 400; throw e; }
  const simulation = await Simulation.findById(simulationId);
  if (!simulation) { const e = new Error('Simulation not found.'); e.status = 404; throw e; }
  const submission = await Submission.create({ userId, simulationId: simulation._id, answer: answer.trim(), xpAwarded: simulation.xpReward });
  const user = await User.findByIdAndUpdate(userId, { $inc: { xp: simulation.xpReward } }, { new: true }).select('_id name xp');
  return { submission, xpAwarded: simulation.xpReward, totalXp: user.xp };
}
async function getMyPortfolio(userId) {
  const projects = await Submission.find({ userId }).populate('simulationId', 'title brief skillTrack xpReward').sort({ completedAt: -1 });
  return { count: projects.length, projects };
}
module.exports = { listSimulations, submitAnswer, getMyPortfolio };
