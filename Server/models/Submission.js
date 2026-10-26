const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  simulationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Simulation', required: true },
  answer: { type: String, required: true, trim: true, maxlength: 10000 },
  completedAt: { type: Date, default: Date.now },
  xpAwarded: { type: Number, required: true }
}, { timestamps: true });
submissionSchema.index({ userId: 1, simulationId: 1 }, { unique: true });
module.exports = mongoose.model('Submission', submissionSchema);
