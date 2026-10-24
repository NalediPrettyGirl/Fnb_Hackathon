const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

function createToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Name, email, password and role are required.' });
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    if (!['freelancer', 'client'].includes(role)) return res.status(400).json({ message: 'Role must be freelancer or client.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, role });
    return res.status(201).json({ message: 'Account created successfully.', token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
    return res.json({ message: 'Login successful.', token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});
module.exports = router;
