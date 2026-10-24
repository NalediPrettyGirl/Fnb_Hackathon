const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp };
}
function createToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}
async function register({ name, email, password, role }) {
  if (!name || !email || !password || !role) {
    const error = new Error('Name, email, password and role are required.'); error.status = 400; throw error;
  }
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    const error = new Error('Name must be between 2 and 80 characters.'); error.status = 400; throw error;
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    const error = new Error('Enter a valid email address.'); error.status = 400; throw error;
  }
  if (typeof password !== 'string' || password.length < 8) {
    const error = new Error('Password must contain at least 8 characters.'); error.status = 400; throw error;
  }
  if (!['freelancer', 'client'].includes(role)) {
    const error = new Error('Role must be freelancer or client.'); error.status = 400; throw error;
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    const error = new Error('An account with this email already exists.'); error.status = 409; throw error;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, role });
  return { user: publicUser(user), token: createToken(user) };
}
async function login({ email, password }) {
  if (!email || !password) { const error = new Error('Email and password are required.'); error.status = 400; throw error; }
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
    const error = new Error('Invalid email or password.'); error.status = 401; throw error;
  }
  return { user: publicUser(user), token: createToken(user) };
}
module.exports = { register, login };
