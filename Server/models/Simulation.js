const mongoose = require('mongoose');
const simulationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  brief: { type: String, required: true, trim: true },
  skillTrack: { type: String, required: true, trim: true },
  xpReward: { type: Number, required: true, min: 1, default: 25 }
}, { timestamps: true });
module.exports = mongoose.model('Simulation', simulationSchema);
