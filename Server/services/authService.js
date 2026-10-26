
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');
const logger = require('../config/logger');

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    xp: user.xp
  };
}

function createToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.');
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      jti: randomUUID()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
}

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function register({ name, email, password, role }) {
  if (!name || !email || !password || !role) {
    throw createError(
      'Name, email, password and role are required.',
      400
    );
  }

  if (
    typeof name !== 'string' ||
    name.trim().length < 2 ||
    name.trim().length > 80
  ) {
    throw createError(
      'Name must be between 2 and 80 characters.',
      400
    );
  }

  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw createError('Enter a valid email address.', 400);
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw createError(
      'Password must contain at least 8 characters.',
      400
    );
  }

  if (!['freelancer', 'client'].includes(role)) {
    throw createError(
      'Role must be freelancer or client.',
      400
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (await User.exists({ email: normalizedEmail })) {
    logger.warn({ event: 'auth.register.duplicate' },
      'Registration rejected: account already exists');

    throw createError(
      'An account with this email already exists.',
      409
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role
  });

  const token = createToken(user);

  logger.info(
    {
      event: 'auth.register.success',
      userId: user._id.toString(),
      role: user.role
    },
    'User registered successfully'
  );

  return {
    user: publicUser(user),
    token
  };
}

async function login({ email, password }) {
  if (
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    throw createError(
      'Email and password are required.',
      400
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail
  }).select('+passwordHash');

  if (
    !user ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    logger.warn(
      { event: 'auth.login.failed' },
      'Login rejected: invalid credentials'
    );

    throw createError('Invalid email or password.', 401);
  }

  const token = createToken(user);

  logger.info(
    {
      event: 'auth.login.success',
      userId: user._id.toString(),
      role: user.role
    },
    'User logged in successfully'
  );

  return {
    user: publicUser(user),
    token
  };
}

async function logout(auth) {
  if (!auth || !auth.jti || !auth.exp) {
    throw createError(
      'The token cannot be revoked. Please log in again.',
      401
    );
  }

  const expiresAt = new Date(auth.exp * 1000);

  if (expiresAt <= new Date()) {
    throw createError('Invalid or expired token.', 401);
  }

  await RevokedToken.updateOne(
    { jti: auth.jti },
    {
      $setOnInsert: {
        jti: auth.jti,
        expiresAt
      }
    },
    { upsert: true }
  );

  logger.info(
    {
      event: 'auth.logout.success',
      userId: auth.sub
    },
    'User logged out successfully'
  );

  return {
    message: 'Logout successful. Your token has been revoked.'
  };
}

module.exports = {
  register,
  login,
  logout
};
