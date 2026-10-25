
const User = require('../models/User');

const editableFields = [
  'name',
  'bio',
  'location',
  'skills',
  'headline',
  'website'
];

function serviceError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getMyProfile(userId) {
  const user = await User.findById(userId)
    .select('name email role xp bio location skills headline website createdAt updatedAt')
    .lean();

  if (!user) {
    throw serviceError('User not found.', 404);
  }

  return user;
}

async function updateMyProfile(userId, body = {}) {
  const fields = Object.keys(body);

  if (!fields.length) {
    throw serviceError('Provide profile fields to update.');
  }

  const unsupported = fields.filter(
    field => !editableFields.includes(field)
  );

  if (unsupported.length) {
    throw serviceError(
      `Unsupported fields: ${unsupported.join(', ')}`
    );
  }

  const update = {};

  for (const field of fields) {
    const value = body[field];

    if (field === 'skills') {
      if (
        !Array.isArray(value) ||
        value.length > 30 ||
        value.some(
          skill =>
            typeof skill !== 'string' ||
            !skill.trim() ||
            skill.trim().length > 40
        )
      ) {
        throw serviceError(
          'Skills must be an array of up to 30 valid strings.'
        );
      }

      update.skills = [
        ...new Set(value.map(skill => skill.trim()))
      ];
      continue;
    }

    if (typeof value !== 'string') {
      throw serviceError(`${field} must be text.`);
    }

    update[field] = value.trim();
  }

  if (
    update.name !== undefined &&
    (update.name.length < 2 || update.name.length > 80)
  ) {
    throw serviceError('Name must be between 2 and 80 characters.');
  }

  if (update.bio && update.bio.length > 500) {
    throw serviceError('Bio cannot exceed 500 characters.');
  }

  if (update.location && update.location.length > 100) {
    throw serviceError('Location cannot exceed 100 characters.');
  }

  if (update.headline && update.headline.length > 120) {
    throw serviceError('Headline cannot exceed 120 characters.');
  }

  if (
    update.website &&
    !/^https?:\/\//i.test(update.website)
  ) {
    throw serviceError('Website must start with http:// or https://.');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true }
  )
    .select('name email role xp bio location skills headline website createdAt updatedAt')
    .lean();

  if (!user) {
    throw serviceError('User not found.', 404);
  }

  return user;
}

module.exports = {
  getMyProfile,
  updateMyProfile
};
