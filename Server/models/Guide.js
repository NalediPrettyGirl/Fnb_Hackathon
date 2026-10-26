const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 160 },
  summary: { type: String, required: true, trim: true, maxlength: 500 },
  content: { type: String, required: true, trim: true, maxlength: 20000 },
  track: { type: String, required: true, trim: true, maxlength: 80 },
  tags: { type: [{ type: String, trim: true, maxlength: 40 }], default: [], validate: v => v.length <= 20 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, versionKey: false });

guideSchema.index({ track: 1, createdAt: -1 });
module.exports = mongoose.model('Guide', guideSchema);
