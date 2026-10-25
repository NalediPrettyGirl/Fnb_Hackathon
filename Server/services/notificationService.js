
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

function serviceError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function listMyNotifications(userId, query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(query.limit, 10) || 20)
  );

  const filter = { userId };

  if (query.unread === 'true') {
    filter.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Notification.countDocuments(filter),

    Notification.countDocuments({
      userId,
      isRead: false
    })
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

async function markNotificationRead(notificationId, userId) {
  if (!mongoose.isValidObjectId(notificationId)) {
    throw serviceError('Invalid notification ID.');
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { new: true }
  ).lean();

  if (!notification) {
    throw serviceError('Notification not found.', 404);
  }

  return notification;
}

async function markAllNotificationsRead(userId) {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  return { modifiedCount: result.modifiedCount };
}

async function createNotification({
  userId,
  type = 'system',
  title,
  message,
  relatedId = null
}) {
  if (!mongoose.isValidObjectId(userId)) {
    throw serviceError('Valid userId is required.');
  }

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.trim().length > 120
  ) {
    throw serviceError('A valid notification title is required.');
  }

  if (
    typeof message !== 'string' ||
    !message.trim() ||
    message.trim().length > 500
  ) {
    throw serviceError('A valid notification message is required.');
  }

  return Notification.create({
    userId,
    type,
    title: title.trim(),
    message: message.trim(),
    relatedId
  });
}

module.exports = {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification
};
