import notificationService from "../services/notificationService.js";

export async function listNotifications(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const unreadOnly = req.query.unreadOnly === "true" || req.query.unread === "true";

    const data = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }

    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, userId);

    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  listNotifications,
  markRead,
};
