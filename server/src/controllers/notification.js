import Notification from "../models/Notification.js";
import { logError } from "../utils/logging.js";
import { getIO } from "../socket/socketHandler.js";

// GET /api/notifications?limit=20
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const rawLimit = Number(req.query.limit || 20);
    const limit = Math.min(50, Math.max(1, isNaN(rawLimit) ? 20 : rawLimit));

    const result = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("senderId", "name avatarUrl")
      .populate("listingId", "title photos");

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
    const count = await Notification.countDocuments({
      recipientId: userId,
      read: false,
    });
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
      { _id: id, recipientId: userId },
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

// PATCH /api/notifications/read-by-type?type=message
export const markByTypeAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;
    if (!type) {
      return res
        .status(400)
        .json({ success: false, msg: "Query param 'type' required" });
    }
    const allowed = [
      "message",
      "favorite",
      "review",
      "review_permission",
      "report",
    ];
    if (!allowed.includes(type)) {
      return res.status(400).json({
        success: false,
        msg: `Invalid type. Allowed: ${allowed.join(", ")}`,
      });
    }
    const result = await Notification.updateMany(
      { recipientId: userId, type, read: false },
      { read: true },
    );
    const io = getIO();
    if (io) io.to(`user_${userId}`).emit("notifications_updated");
    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logError(error);
    return res
      .status(500)
      .json({ success: false, msg: "Unable to mark by type as read" });
  }
};

// PATCH /api/notifications/read-by-listing?listingId=xxx
export const markByListingAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { listingId } = req.query;
    if (!listingId) {
      return res
        .status(400)
        .json({ success: false, msg: "Query param 'listingId' required" });
    }
    const result = await Notification.updateMany(
      { recipientId: userId, listingId, read: false },
      { read: true },
    );
    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logError(error);
    return res
      .status(500)
      .json({ success: false, msg: "Unable to mark by listing as read" });
  }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipientId: userId, read: false },
      { read: true },
    );
    const io = getIO();
    if (io) io.to(`user_${userId}`).emit("notifications_updated");
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
