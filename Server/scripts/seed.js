require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Simulation = require('../models/Simulation');

const simulationSeed = [
  { title: 'Clean a Messy Sales Dataset', brief: 'Describe how you would handle missing values, duplicates, inconsistent date formats and invalid sales amounts before analysis.', skillTrack: 'Data Analytics', xpReward: 25 },
  { title: 'Write a SQL Business Query', brief: 'Write a SQL query that returns monthly revenue by product category from an orders table. Explain your assumptions.', skillTrack: 'SQL', xpReward: 30 },
  { title: 'Design a REST API', brief: 'Outline endpoints and validation for a simple task-management API. Include status codes for success and common errors.', skillTrack: 'Web Development', xpReward: 30 },
  { title: 'Improve a User Journey', brief: 'A user abandons a three-step registration form. Suggest three changes and explain how you would test whether they work.', skillTrack: 'UI/UX Design', xpReward: 25 },
  { title: 'Communicate an Insight', brief: 'You find that sales fell 15% this month. List the checks and supporting evidence you would gather before recommending action.', skillTrack: 'Business Analysis', xpReward: 35 }
];

const gigSeed = [
  { title: 'Build a Small Business Landing Page', description: 'Create a responsive one-page website for a local service business. Include services, contact details and a WhatsApp call-to-action.', budget: 1800, skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'] },
  { title: 'Sales Data Cleanup and Summary', description: 'Clean a spreadsheet of sales records, document data-quality issues and prepare a concise summary of monthly performance.', budget: 1200, skills: ['Excel', 'Data Cleaning', 'Reporting'] },
  { title: 'Create a Basic MongoDB API', description: 'Build a small Express REST API with CRUD endpoints, request validation and MongoDB persistence.', budget: 2500, skills: ['Node.js', 'Express', 'MongoDB', 'REST API'] }
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and configure MongoDB.');
  await mongoose.connect(process.env.MONGODB_URI);
  let client = await User.findOne({ email: 'demo.client@skillbridge.local' });
  if (!client) client = await User.create({ name: 'SkillBridge Demo Client', email: 'demo.client@skillbridge.local', passwordHash: await bcrypt.hash('DemoClient123!', 12), role: 'client' });
  const existingGigs = await Gig.countDocuments();
  if (existingGigs === 0) await Gig.insertMany(gigSeed.map(gig => ({ ...gig, postedBy: client._id })));
  for (const item of simulationSeed) await Simulation.updateOne({ title: item.title }, { $setOnInsert: item }, { upsert: true });
  console.log(`Seed complete. Gigs in database: ${await Gig.countDocuments()}; simulations: ${await Simulation.countDocuments()}.`);
  console.log('Demo client login: demo.client@skillbridge.local / DemoClient123!');
  await mongoose.disconnect();
}
seed().catch(async error => { console.error(error); await mongoose.disconnect().catch(() => {}); process.exit(1); });
