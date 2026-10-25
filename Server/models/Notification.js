const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['application_received', 'application_accepted', 'application_rejected', 'system'], default: 'system' },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  isRead: { type: Boolean, default: false, index: true }
}, { timestamps: true, versionKey: false });

notificationSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', notificationSchema);
