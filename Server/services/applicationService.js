const mongoose = require('mongoose');
const Application = require('../models/Application');

async function listMyApplications(userId) {
  const applications = await Application.find({ userId })
    .populate({ path: 'gigId', select: 'title budget skills status postedBy', populate: { path: 'postedBy', select: 'name' } })
    .sort({ createdAt: -1 });
  return { count: applications.length, applications };
}
async function updateStatus(applicationId, status, clientId) {
  if (!mongoose.isValidObjectId(applicationId)) { const e = new Error('Invalid application id.'); e.status = 400; throw e; }
  if (!['accepted', 'rejected'].includes(status)) { const e = new Error('Status must be accepted or rejected.'); e.status = 400; throw e; }
  const application = await Application.findById(applicationId).populate('gigId');
  if (!application) { const e = new Error('Application not found.'); e.status = 404; throw e; }
  if (!application.gigId || String(application.gigId.postedBy) !== String(clientId)) {
    const e = new Error('You can only review applications to your own gigs.'); e.status = 403; throw e;
  }
  application.status = status;
  await application.save();
  return application;
}
module.exports = { listMyApplications, updateStatus };
