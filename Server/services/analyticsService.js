
const mongoose = require('mongoose');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Application = require('../models/Application');

function serviceError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getMyAnalytics(userId) {
  const user = await User.findById(userId)
    .select('name role xp createdAt')
    .lean();

  if (!user) {
    throw serviceError('User not found.', 404);
  }

  const [submissions, applicationStats] = await Promise.all([
    Submission.find({ userId })
      .populate('simulationId', 'title skillTrack xpReward')
      .sort({ completedAt: -1 })
      .lean(),

    Application.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(String(userId))
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const applications = {
    pending: 0,
    accepted: 0,
    rejected: 0
  };

  for (const item of applicationStats) {
    applications[item._id] = item.count;
  }

  const skillTracksPractised = [
    ...new Set(
      submissions
        .map(item => item.simulationId?.skillTrack)
        .filter(Boolean)
    )
  ];

  const earnedXp = submissions.reduce(
    (total, item) => total + (Number(item.xpAwarded) || 0),
    0
  );

  return {
    user,
    progress: {
      completedSimulations: submissions.length,
      earnedXp,
      currentXp: user.xp || 0,
      skillTracksPractised,
      applications
    },
    recentSubmissions: submissions.slice(0, 10)
  };
}

module.exports = { getMyAnalytics };
