const mongoose = require('mongoose');
const simulationSchema = new mongoose.Schema({
  title:             { type: String, required: true, trim: true },
  brief:             { type: String, required: true, trim: true },
  skillTrack:        { type: String, required: true, trim: true },
  xpReward:          { type: Number, required: true, min: 1, default: 25 },
  difficulty:        { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  estimatedMinutes:  { type: Number, default: 20 },
  company:           { type: String, trim: true, default: '' },
  industry:          { type: String, trim: true, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Simulation', simulationSchema);
