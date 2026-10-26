
const Gig = require('../models/Gig');
const Application = require('../models/Application');
const Submission = require('../models/Submission');
const Simulation = require('../models/Simulation');

/**
 * Safely writes a log message when a Pino logger is provided.
 * The logger is passed in from the authenticated request.
 */
function logEvent(logger, level, details, message) {
  if (logger && typeof logger[level] === 'function') {
    logger[level](details, message);
  }
}

/**
 * Builds the dashboard for the authenticated user.
 *
 * @param {Object} user - Authenticated Mongoose User document.
 * @param {Object} logger - Optional Pino request logger.
 * @returns {Promise<Object>} Role-specific dashboard data.
 */
async function getDashboard(user, logger) {
  if (!user || !user._id || !user.role) {
    const error = new Error('A valid authenticated user is required.');
    error.statusCode = 401;
    throw error;
  }

  logEvent(
    logger,
    'info',
    { userId: String(user._id), role: user.role },
    'Loading SkillBridge dashboard'
  );

  try {
    let dashboard;

    switch (user.role) {
      case 'freelancer':
        dashboard = await getFreelancerDashboard(user, logger);
        break;

      case 'client':
        dashboard = await getClientDashboard(user, logger);
        break;

      default: {
        const error = new Error('Unsupported dashboard role.');
        error.statusCode = 403;
        throw error;
      }
    }

    logEvent(
      logger,
      'info',
      { userId: String(user._id), role: user.role },
      'SkillBridge dashboard loaded successfully'
    );

    return dashboard;
  } catch (error) {
    logEvent(
      logger,
      'error',
      {
        err: error,
        userId: String(user._id),
        role: user.role
      },
      'Failed to load SkillBridge dashboard'
    );

    throw error;
  }
}

/**
 * Returns statistics and useful next actions for a freelancer.
 */
async function getFreelancerDashboard(user, logger) {
  const userId = user._id;

  const [
    totalSimulations,
    completedSimulations,
    applicationCounts,
    recentApplications,
    recentSubmissions,
    appliedGigIds
  ] = await Promise.all([
    Simulation.countDocuments(),

    Submission.countDocuments({ userId }),

    Application.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),

    Application.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('gigId status createdAt updatedAt')
      .populate({
        path: 'gigId',
        select: 'title budget skills status postedBy'
      })
      .lean(),

    Submission.find({ userId })
      .sort({ completedAt: -1 })
      .limit(5)
      .select('simulationId completedAt xpAwarded')
      .populate({
        path: 'simulationId',
        select: 'title skillTrack xpReward'
      })
      .lean(),

    Application.distinct('gigId', { userId })
  ]);

  const applications = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  };

  for (const item of applicationCounts) {
    if (Object.prototype.hasOwnProperty.call(applications, item._id)) {
      applications[item._id] = item.count;
      applications.total += item.count;
    }
  }

  const completionPercentage = totalSimulations === 0
    ? 0
    : Math.min(
        100,
        Math.round((completedSimulations / totalSimulations) * 100)
      );

  const recommendedGigs = await Gig.find({
    status: 'open',
    postedBy: { $ne: userId },
    _id: { $nin: appliedGigIds }
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title description budget skills createdAt postedBy')
    .populate({
      path: 'postedBy',
      select: 'name'
    })
    .lean();

  const xp = Number(user.xp) || 0;

  logEvent(
    logger,
    'debug',
    {
      userId: String(userId),
      completedSimulations,
      totalSimulations,
      applications: applications.total,
      recommendedGigs: recommendedGigs.length
    },
    'Freelancer dashboard metrics calculated'
  );

  return {
    role: 'freelancer',

    user: {
      id: String(userId),
      name: user.name,
      role: user.role
    },

    stats: {
      xp,
      totalSimulations,
      completedSimulations,
      remainingSimulations: Math.max(
        0,
        totalSimulations - completedSimulations
      ),
      completionPercentage,
      applications
    },

    recentApplications: recentApplications.map((application) => ({
      id: String(application._id),
      status: application.status,
      appliedAt: application.createdAt,
      updatedAt: application.updatedAt,
      gig: application.gigId
        ? {
            id: String(application.gigId._id),
            title: application.gigId.title,
            budget: application.gigId.budget,
            skills: application.gigId.skills,
            status: application.gigId.status
          }
        : null
    })),

    recentSubmissions: recentSubmissions.map((submission) => ({
      id: String(submission._id),
      completedAt: submission.completedAt,
      xpAwarded: submission.xpAwarded,
      simulation: submission.simulationId
        ? {
            id: String(submission.simulationId._id),
            title: submission.simulationId.title,
            skillTrack: submission.simulationId.skillTrack
          }
        : null
    })),

    recommendedGigs: recommendedGigs.map((gig) => ({
      id: String(gig._id),
      title: gig.title,
      description: gig.description,
      budget: gig.budget,
      skills: gig.skills,
      createdAt: gig.createdAt,
      client: gig.postedBy
        ? { name: gig.postedBy.name }
        : null
    }))
  };
}

/**
 * Returns gig performance and incoming application statistics for a client.
 */
async function getClientDashboard(user, logger) {
  const userId = user._id;

  const [
    totalGigs,
    openGigs,
    closedGigs,
    postedGigs
  ] = await Promise.all([
    Gig.countDocuments({ postedBy: userId }),

    Gig.countDocuments({ postedBy: userId, status: 'open' }),

    Gig.countDocuments({ postedBy: userId, status: 'closed' }),

    Gig.find({ postedBy: userId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title budget status skills createdAt updatedAt')
      .lean()
  ]);

  const gigIds = postedGigs.map((gig) => gig._id);

  const [applicationCounts, recentApplications] = gigIds.length
    ? await Promise.all([
        Application.aggregate([
          { $match: { gigId: { $in: gigIds } } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),

        Application.find({ gigId: { $in: gigIds } })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('gigId userId status coverNote createdAt updatedAt')
          .populate({
            path: 'userId',
            select: 'name'
          })
          .populate({
            path: 'gigId',
            select: 'title budget status'
          })
          .lean()
      ])
    : [[], []];

  const applications = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  };

  for (const item of applicationCounts) {
    if (Object.prototype.hasOwnProperty.call(applications, item._id)) {
      applications[item._id] = item.count;
      applications.total += item.count;
    }
  }

  logEvent(
    logger,
    'debug',
    {
      userId: String(userId),
      totalGigs,
      openGigs,
      closedGigs,
      totalApplications: applications.total,
      pendingApplications: applications.pending
    },
    'Client dashboard metrics calculated'
  );

  return {
    role: 'client',

    user: {
      id: String(userId),
      name: user.name,
      role: user.role
    },

    stats: {
      totalGigs,
      openGigs,
      closedGigs,
      applications
    },

    recentGigs: postedGigs.map((gig) => ({
      id: String(gig._id),
      title: gig.title,
      budget: gig.budget,
      status: gig.status,
      skills: gig.skills,
      createdAt: gig.createdAt,
      updatedAt: gig.updatedAt
    })),

    recentApplications: recentApplications.map((application) => ({
      id: String(application._id),
      status: application.status,
      coverNote: application.coverNote,
      appliedAt: application.createdAt,
      updatedAt: application.updatedAt,
      freelancer: application.userId
        ? {
            id: String(application.userId._id),
            name: application.userId.name
          }
        : null,
      gig: application.gigId
        ? {
            id: String(application.gigId._id),
            title: application.gigId.title,
            budget: application.gigId.budget,
            status: application.gigId.status
          }
        : null
    }))
  };
}

module.exports = {
  getDashboard
};

