import Notification from "../models/Notification.js";
import { logError } from "../util/logging.js";

// GET /api/notifications?limit=20
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Number(req.query.limit || 20);

    const result = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({ success: true, result });
  } catch (error) {
    logError(error);
    return res
      .status(500)
      .json({ success: false, msg: "Unable to fetch notifications" });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, read: false });
    return res.status(200).json({ success: true, result: count });
  } catch (error) {
    logError(error);
    return res
      .status(500)
      .json({ success: false, msg: "Unable to fetch unread count" });
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, msg: "Notification not found" });
    }

    return res.status(200).json({ success: true, result: updated });
  } catch (error) {
    logError(error);
    return res
      .status(500)
      .json({ success: false, msg: "Unable to mark as read" });
  }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ userId, read: false }, { read: true });

    return res
      .status(200)
      .json({ success: true, msg: "All notifications marked as read" });
  } catch (error) {
    logError(error);
    return res
      .status(500)
      .json({ success: false, msg: "Unable to mark all as read" });
  }
};
