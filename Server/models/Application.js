const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverNote: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });
applicationSchema.index({ gigId: 1, userId: 1 }, { unique: true });
module.exports = mongoose.model('Application', applicationSchema);
