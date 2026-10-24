require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDatabase = require('./config/database');
const authRoutes = require('./routes/auth');
const gigRoutes = require('./routes/gigs');
const applicationRoutes = require('./routes/applications');
const simulationRoutes = require('./routes/simulations');
const dashboardRoutes = require('./routes/dashboard');
const portfolioRoutes = require('./routes/portfolio');
const guideRoutes = require('./routes/guides');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set in .env and contain at least 32 characters.'); process.exit(1);
}
const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
const origins = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map(v => v.trim()) : true;
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' }));
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api', (_req, res) => res.status(404).json({ message: 'API endpoint not found.' }));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/style.css', (_req, res) => res.sendFile(path.join(__dirname, 'style.css')));
app.get('/script.js', (_req, res) => res.sendFile(path.join(__dirname, 'script.js')));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ message: 'A record with these details already exists.' });
  if (error.status) return res.status(error.status).json({ message: error.message });
  if (error.name === 'ValidationError') return res.status(400).json({ message: 'Validation failed.', details: Object.values(error.errors).map(e => e.message) });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid id or data format.' });
  return res.status(500).json({ message: 'Unexpected server error.' });
});
const PORT = Number(process.env.PORT) || 3000;
connectDatabase().then(() => app.listen(PORT, () => console.log(`SkillBridge running at http://localhost:${PORT}`)))
  .catch(error => { console.error('Could not connect to MongoDB:', error.message); process.exit(1); });
