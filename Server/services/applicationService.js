
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Gig = require('../models/Gig');

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateId(id, label = 'application') {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(`Invalid ${label} ID.`, 400);
  }
}

async function listMyApplications(userId, logger) {
  const applications = await Application.find({ userId })
    .populate({
      path: 'gigId',
      select: 'title budget skills status postedBy',
      populate: { path: 'postedBy', select: 'name' }
    })
    .sort({ createdAt: -1 })
    .lean();

  logger?.info({
    userId: String(userId),
    count: applications.length
  }, 'Freelancer applications retrieved');

  return {
    count: applications.length,
    applications
  };
}

async function listApplicationsForGig(gigId, clientId, logger) {
  validateId(gigId, 'gig');

  const gig = await Gig.findById(gigId).select('postedBy title').lean();

  if (!gig) {
    throw createError('Gig not found.', 404);
  }

  if (String(gig.postedBy) !== String(clientId)) {
    throw createError(
      'You can only view applications for your own gigs.',
      403
    );
  }

  const applications = await Application.find({ gigId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  logger?.info({
    clientId: String(clientId),
    gigId: String(gigId),
    count: applications.length
  }, 'Applications for gig retrieved');

  return {
    gig,
    count: applications.length,
    applications
  };
}

async function updateStatus(applicationId, status, clientId, logger) {
  validateId(applicationId);

  if (!['accepted', 'rejected'].includes(status)) {
    throw createError(
      'Status must be either accepted or rejected.',
      400
    );
  }

  const application = await Application.findById(applicationId)
    .populate('gigId');

  if (!application) {
    throw createError('Application not found.', 404);
  }

  if (
    !application.gigId ||
    String(application.gigId.postedBy) !== String(clientId)
  ) {
    throw createError(
      'You can only review applications for your own gigs.',
      403
    );
  }

  if (application.status !== 'pending') {
    throw createError(
      `This application has already been ${application.status}.`,
      409
    );
  }

  application.status = status;
  await application.save();

  await application.populate([
    { path: 'userId', select: 'name email' },
    {
      path: 'gigId',
      select: 'title budget status postedBy',
      populate: { path: 'postedBy', select: 'name' }
    }
  ]);

  logger?.info({
    applicationId: String(application._id),
    gigId: String(application.gigId._id),
    clientId: String(clientId),
    status
  }, 'Application status updated');

  return application;
}

module.exports = {
  listMyApplications,
  listApplicationsForGig,
  updateStatus
};
