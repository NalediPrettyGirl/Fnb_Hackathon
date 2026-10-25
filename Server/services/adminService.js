
const mongoose = require('mongoose');

const User = require('../models/User');
const Gig = require('../models/Gig');
const Application = require('../models/Application');
const Simulation = require('../models/Simulation');
const Submission = require('../models/Submission');

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isAdmin(user) {
  const adminEmail = String(process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();

  return Boolean(
    adminEmail &&
    user?.email &&
    String(user.email).trim().toLowerCase() === adminEmail
  );
}

function requireAdminConfiguration() {
  if (!process.env.ADMIN_EMAIL?.trim()) {
    throw createError(
      'Administrator access is not configured.',
      503
    );
  }
}

async function getOverview() {
  const [
    totalUsers,
    totalGigs,
    totalApplications,
    totalSimulations,
    totalSubmissions
  ] = await Promise.all([
    User.countDocuments(),
    Gig.countDocuments(),
    Application.countDocuments(),
    Simulation.countDocuments(),
    Submission.countDocuments()
  ]);

  return {
    users: totalUsers,
    gigs: totalGigs,
    applications: totalApplications,
    simulations: totalSimulations,
    submissions: totalSubmissions
  };
}

async function listUsers(query = {}) {
  const page = Math.max(
    1,
    Number.parseInt(query.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 20)
  );

  const filter = {};

  if (['client', 'freelancer'].includes(query.role)) {
    filter.role = query.role;
  }

  if (typeof query.search === 'string' && query.search.trim()) {
    const escaped = query.search.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -passwordHash -__v')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    User.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function updateUserRole(userId, role, requestingUserId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError('Invalid user ID.');
  }

  if (!['client', 'freelancer'].includes(role)) {
    throw createError(
      'Role must be either client or freelancer.'
    );
  }

  if (String(userId) === String(requestingUserId)) {
    throw createError(
      'You cannot change your own role.',
      403
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw createError('User not found.', 404);
  }

  // Do not allow changing the configured administrator's role.
  if (isAdmin(user)) {
    throw createError(
      'The configured administrator role cannot be changed here.',
      403
    );
  }

  user.role = role;
  await user.save();

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

module.exports = {
  getOverview,
  listUsers,
  updateUserRole
};
