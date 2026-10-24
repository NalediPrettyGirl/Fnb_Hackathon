const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Application = require('../models/Application');

async function listGigs(query = {}) {
  const filter = {};
  if (query.status !== 'all') filter.status = query.status || 'open';
  if (query.search) {
    const term = String(query.search).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { skills: { $regex: term, $options: 'i' } }
    ];
  }
  const gigs = await Gig.find(filter).populate('postedBy', 'name').sort({ createdAt: -1 }).limit(100);
  return { count: gigs.length, gigs };
}
async function getGig(id) {
  if (!mongoose.isValidObjectId(id)) { const e = new Error('Invalid gig id.'); e.status = 400; throw e; }
  const gig = await Gig.findById(id).populate('postedBy', 'name');
  if (!gig) { const e = new Error('Gig not found.'); e.status = 404; throw e; }
  return gig;
}
async function createGig(input, userId) {
  const { title, description, budget, skills = [] } = input || {};
  if (!title || !description || budget === undefined || !Number.isFinite(Number(budget)) || Number(budget) < 0) {
    const e = new Error('Title, description and a non-negative numeric budget are required.'); e.status = 400; throw e;
  }
  if (!Array.isArray(skills) || skills.length > 20 || skills.some(s => typeof s !== 'string')) {
    const e = new Error('Skills must be an array of up to 20 strings.'); e.status = 400; throw e;
  }
  const gig = await Gig.create({ title, description, budget: Number(budget), skills: skills.map(s => s.trim()).filter(Boolean), postedBy: userId });
  await gig.populate('postedBy', 'name');
  return gig;
}
async function applyToGig(id, userId, coverNote = '') {
  if (!mongoose.isValidObjectId(id)) { const e = new Error('Invalid gig id.'); e.status = 400; throw e; }
  const gig = await Gig.findById(id);
  if (!gig) { const e = new Error('Gig not found.'); e.status = 404; throw e; }
  if (gig.status !== 'open') { const e = new Error('This gig is closed and no longer accepting applications.'); e.status = 400; throw e; }
  if (typeof coverNote !== 'string') { const e = new Error('Cover note must be text.'); e.status = 400; throw e; }
  return Application.create({ gigId: gig._id, userId, coverNote: coverNote.trim() });
}
module.exports = { listGigs, getGig, createGig, applyToGig };
