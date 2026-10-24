const Application = require('../models/Application');
const Submission = require('../models/Submission');
async function getDashboard(user) {
  const [completedTasks, applicationCounts] = await Promise.all([
    Submission.countDocuments({ userId: user._id }),
    Application.aggregate([{ $match: { userId: user._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  const applications = { total: 0, pending: 0, accepted: 0, rejected: 0 };
  for (const row of applicationCounts) { applications[row._id] = row.count; applications.total += row.count; }
  return { user: { id: user._id, name: user.name, role: user.role }, xp: user.xp, completedTasks, applications };
}
module.exports = { getDashboard };
