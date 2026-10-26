
const mongoose = require('mongoose');
const Simulation = require('../models/Simulation');
const Submission = require('../models/Submission');
const User = require('../models/User');

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateId(id, label = 'simulation') {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(`Invalid ${label} ID.`, 400);
  }
}

async function listSimulations(query = {}, logger) {
  const filter = {};

  if (query.skillTrack) {
    const skillTrack = String(query.skillTrack).trim().slice(0, 100);
    filter.skillTrack = {
      $regex: skillTrack.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i'
    };
  }

  const simulations = await Simulation.find(filter)
    .select('title brief skillTrack xpReward createdAt')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  logger?.info({
    count: simulations.length,
    skillTrack: query.skillTrack || null
  }, 'Simulations retrieved');

  return {
    count: simulations.length,
    simulations
  };
}

async function getSimulationById(id, logger) {
  validateId(id);

  const simulation = await Simulation.findById(id)
    .select('title brief skillTrack xpReward createdAt')
    .lean();

  if (!simulation) {
    throw createError('Simulation not found.', 404);
  }

  logger?.info({
    simulationId: String(id)
  }, 'Simulation retrieved');

  return simulation;
}

async function submitSimulation(userId, simulationId, answer, logger) {
  validateId(simulationId);

  if (typeof answer !== 'string' || !answer.trim()) {
    throw createError('A non-empty answer is required.', 400);
  }

  const cleanAnswer = answer.trim();

  if (cleanAnswer.length > 10000) {
    throw createError('Answer cannot exceed 10000 characters.', 400);
  }

  const simulation = await Simulation.findById(simulationId)
    .select('title skillTrack xpReward');

  if (!simulation) {
    throw createError('Simulation not found.', 404);
  }

  // Create first: the unique index prevents duplicate submissions.
  // XP is awarded only after a submission has been created successfully.
  let submission;

  try {
    submission = await Submission.create({
      userId,
      simulationId: simulation._id,
      answer: cleanAnswer,
      xpAwarded: simulation.xpReward
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createError(
        'You have already submitted this simulation.',
        409
      );
    }

    throw error;
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { xp: simulation.xpReward } },
      { new: true, runValidators: true }
    ).select('name xp');

    if (!user) {
      throw createError('User account not found.', 404);
    }

    logger?.info({
      userId: String(userId),
      simulationId: String(simulation._id),
      submissionId: String(submission._id),
      xpAwarded: simulation.xpReward,
      totalXp: user.xp
    }, 'Simulation submitted and XP awarded');

    return {
      message: 'Simulation submitted successfully.',
      submission,
      xpAwarded: simulation.xpReward,
      totalXp: user.xp
    };
  } catch (error) {
    // Avoid leaving a submission behind if the XP update fails.
    await Submission.deleteOne({ _id: submission._id }).catch(() => {});

    throw error;
  }
}

async function getMyPortfolio(userId, logger) {
  const [user, submissions] = await Promise.all([
    User.findById(userId).select('name xp').lean(),
    Submission.find({ userId })
      .populate({
        path: 'simulationId',
        select: 'title brief skillTrack xpReward'
      })
      .sort({ completedAt: -1 })
      .lean()
  ]);

  if (!user) {
    throw createError('User account not found.', 404);
  }

  const earnedXp = submissions.reduce(
    (total, submission) => total + submission.xpAwarded,
    0
  );

  logger?.info({
    userId: String(userId),
    completedSimulations: submissions.length
  }, 'Portfolio retrieved');

  return {
    user,
    completedCount: submissions.length,
    earnedXp,
    submissions
  };
}

module.exports = {
  listSimulations,
  getSimulationById,
  submitSimulation,
  getMyPortfolio
};
