
const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Application = require('../models/Application');

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeSkills(skills) {
  if (skills === undefined) return [];

  if (
    !Array.isArray(skills) ||
    skills.length > 20 ||
    skills.some(skill =>
      typeof skill !== 'string' ||
      skill.trim().length === 0 ||
      skill.trim().length > 40
    )
  ) {
    throw createError(
      'Skills must be an array of up to 20 non-empty strings, each no longer than 40 characters.',
      400
    );
  }

  // Remove duplicates without treating capitalization as different.
  const unique = new Map();

  for (const skill of skills) {
    const normalized = skill.trim();
    const key = normalized.toLowerCase();

    if (!unique.has(key)) unique.set(key, normalized);
  }

  return [...unique.values()];
}

function validateGigInput(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw createError('A valid gig request body is required.', 400);
  }

  const data = {};

  if (!partial || input.title !== undefined) {
    if (
      typeof input.title !== 'string' ||
      input.title.trim().length < 3 ||
      input.title.trim().length > 120
    ) {
      throw createError(
        'Title must be between 3 and 120 characters.',
        400
      );
    }

    data.title = input.title.trim();
  }

  if (!partial || input.description !== undefined) {
    if (
      typeof input.description !== 'string' ||
      input.description.trim().length < 10 ||
      input.description.trim().length > 5000
    ) {
      throw createError(
        'Description must be between 10 and 5000 characters.',
        400
      );
    }

    data.description = input.description.trim();
  }

  if (!partial || input.budget !== undefined) {
    const budget = input.budget;

    if (
      budget === '' ||
      budget === null ||
      budget === undefined ||
      !Number.isFinite(Number(budget)) ||
      Number(budget) < 0
    ) {
      throw createError(
        'Budget must be a non-negative number.',
        400
      );
    }

    data.budget = Number(budget);
  }

  if (!partial || input.skills !== undefined) {
    data.skills = normalizeSkills(input.skills);
  }

  return data;
}

function validateId(id, label = 'gig') {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(`Invalid ${label} id.`, 400);
  }
}

async function getOwnedGig(id, userId) {
  validateId(id);

  const gig = await Gig.findById(id);

  if (!gig) {
    throw createError('Gig not found.', 404);
  }

  if (String(gig.postedBy) !== String(userId)) {
    throw createError('You can only manage your own gigs.', 403);
  }

  return gig;
}

// Browse and search gigs with filters and pagination.
async function listGigs(query = {}, logger) {
  const filter = {};

  const status = query.status || 'open';

  if (!['open', 'closed', 'all'].includes(status)) {
    throw createError(
      'Status must be open, closed, or all.',
      400
    );
  }

  if (status !== 'all') {
    filter.status = status;
  }

  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      throw createError('Search must be text.', 400);
    }

    const search = query.search.trim().slice(0, 100);

    if (search) {
      const escaped = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { skills: { $regex: escaped, $options: 'i' } }
      ];
    }
  }

  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw createError(
      'Page must be a positive integer and limit must be between 1 and 100.',
      400
    );
  }

  const [total, gigs] = await Promise.all([
    Gig.countDocuments(filter),
    Gig.find(filter)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  ]);

  logger?.info(
    { status, page, limit, total },
    'Gigs listed successfully'
  );

  return {
    count: gigs.length,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    gigs
  };
}

// Retrieve one gig by its MongoDB ID.
async function getGig(id, logger) {
  validateId(id);

  const gig = await Gig.findById(id)
    .populate('postedBy', 'name')
    .lean();

  if (!gig) {
    throw createError('Gig not found.', 404);
  }

  logger?.info({ gigId: String(id) }, 'Gig retrieved');

  return gig;
}

// Create a gig for the authenticated client.
async function createGig(input, userId, logger) {
  const data = validateGigInput(input);

  const gig = await Gig.create({
    ...data,
    postedBy: userId
  });

  await gig.populate('postedBy', 'name');

  logger?.info(
    { gigId: String(gig._id), userId: String(userId) },
    'Gig created'
  );

  return gig;
}

// Update editable fields on a gig owned by the client.
async function updateGig(id, input, userId, logger) {
  const data = validateGigInput(input, true);

  if (Object.keys(data).length === 0) {
    throw createError('Provide at least one field to update.', 400);
  }

  const gig = await getOwnedGig(id, userId);

  Object.assign(gig, data);
  await gig.save();
  await gig.populate('postedBy', 'name');

  logger?.info(
    { gigId: String(id), userId: String(userId) },
    'Gig updated'
  );

  return gig;
}

// Open or close a gig owned by the client.
async function updateGigStatus(id, status, userId, logger) {
  if (!['open', 'closed'].includes(status)) {
    throw createError('Status must be open or closed.', 400);
  }

  const gig = await getOwnedGig(id, userId);

  gig.status = status;
  await gig.save();
  await gig.populate('postedBy', 'name');

  logger?.info(
    { gigId: String(id), userId: String(userId), status },
    'Gig status updated'
  );

  return gig;
}

// Delete only if there are no applications linked to the gig.
// Otherwise, close the gig to preserve application history.
async function deleteGig(id, userId, logger) {
  const gig = await getOwnedGig(id, userId);

  const hasApplications = await Application.exists({
    gigId: gig._id
  });

  if (hasApplications) {
    throw createError(
      'This gig has applications and cannot be deleted. Close it instead.',
      409
    );
  }

  await gig.deleteOne();

  logger?.info(
    { gigId: String(id), userId: String(userId) },
    'Gig deleted'
  );

  return { id: String(id) };
}

// Apply to an open gig as a freelancer.
async function applyToGig(id, userId, coverNote = '', logger) {
  validateId(id);

  if (typeof coverNote !== 'string') {
    throw createError('Cover note must be text.', 400);
  }

  if (coverNote.trim().length > 2000) {
    throw createError(
      'Cover note cannot exceed 2000 characters.',
      400
    );
  }

  const gig = await Gig.findById(id);

  if (!gig) {
    throw createError('Gig not found.', 404);
  }

  if (gig.status !== 'open') {
    throw createError(
      'This gig is closed and no longer accepting applications.',
      400
    );
  }

  if (String(gig.postedBy) === String(userId)) {
    throw createError('You cannot apply to your own gig.', 403);
  }

  const application = await Application.create({
    gigId: gig._id,
    userId,
    coverNote: coverNote.trim()
  });

  logger?.info(
    {
      gigId: String(gig._id),
      applicationId: String(application._id),
      userId: String(userId)
    },
    'Gig application created'
  );

  return application;
}

module.exports = {
  listGigs,
  getGig,
  createGig,
  updateGig,
  updateGigStatus,
  deleteGig,
  applyToGig
};
