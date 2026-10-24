const express = require('express');
const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Application = require('../models/Application');
const { requireAuth, allowRoles } = require('../middleware/auth');
const router = express.Router();

// Public browsing; optional search by keyword or skill and optional status filter.
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status !== 'all') filter.status = req.query.status || 'open';
    if (req.query.search) {
      const term = String(req.query.search).trim().slice(0, 100);
      filter.$or = [{ title: { $regex: term, $options: 'i' } }, { description: { $regex: term, $options: 'i' } }, { skills: { $regex: term, $options: 'i' } }];
    }
    const gigs = await Gig.find(filter).populate('postedBy', 'name').sort({ createdAt: -1 }).limit(100);
    res.json({ count: gigs.length, gigs });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, allowRoles('client'), async (req, res, next) => {
  try {
    const { title, description, budget, skills = [] } = req.body || {};
    if (!title || !description || budget === undefined || !Number.isFinite(Number(budget)) || Number(budget) < 0) {
      return res.status(400).json({ message: 'Title, description and a non-negative numeric budget are required.' });
    }
    if (!Array.isArray(skills) || skills.length > 20 || skills.some(s => typeof s !== 'string')) return res.status(400).json({ message: 'Skills must be an array of up to 20 strings.' });
    const gig = await Gig.create({ title, description, budget: Number(budget), skills: skills.map(s => s.trim()).filter(Boolean), postedBy: req.user._id });
    await gig.populate('postedBy', 'name');
    res.status(201).json({ message: 'Gig posted successfully.', gig });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid gig id.' });
    const gig = await Gig.findById(req.params.id).populate('postedBy', 'name');
    if (!gig) return res.status(404).json({ message: 'Gig not found.' });
    res.json({ gig });
  } catch (error) { next(error); }
});

router.post('/:id/apply', requireAuth, allowRoles('freelancer'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid gig id.' });
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found.' });
    if (gig.status !== 'open') return res.status(400).json({ message: 'This gig is closed and no longer accepting applications.' });
    const coverNote = typeof req.body?.coverNote === 'string' ? req.body.coverNote.trim() : '';
    const application = await Application.create({ gigId: gig._id, userId: req.user._id, coverNote });
    res.status(201).json({ message: 'Application submitted.', application });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already applied to this gig.' });
    next(error);
  }
});
module.exports = router;
