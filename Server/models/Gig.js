const mongoose = require('mongoose');
const gigSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  budget: { type: Number, required: true, min: 0 },
  skills: [{ type: String, trim: true, maxlength: 40 }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });
module.exports = mongoose.model('Gig', gigSchema);
