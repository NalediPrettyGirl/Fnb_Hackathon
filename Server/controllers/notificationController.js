
const notificationService = require('../services/notificationService');

exports.mine = async (req, res, next) => {
  try {
    const result = await notificationService.listMyNotifications(
      req.user._id,
      req.query
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    req.log?.error({ err: error }, 'List notifications failed');
    return next(error);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const notification =
      await notificationService.markNotificationRead(
        req.params.id,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { notification }
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Mark notification read failed');
    return next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const result =
      await notificationService.markAllNotificationsRead(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read.',
      data: result
    });
  } catch (error) {
    req.log?.error({ err: error }, 'Mark all notifications read failed');
    return next(error);
  }
};
