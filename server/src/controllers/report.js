import mongoose from "mongoose";
import Report from "../models/Report.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { emitNotification } from "../socket/socketHandler.js";
import { logError } from "../utils/logging.js";

export const createReport = async (req, res) => {
  try {
    const { targetId, targetType, reason } = req.body;

    if (!targetId || !targetType || !reason) {
      return res.status(400).json({
        success: false,
        msg: "Target ID, Target Type, and Reason are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid Target ID format.",
      });
    }

    if (!["Listing", "User"].includes(targetType)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid Target Type. Must be 'Listing' or 'User'.",
      });
    }

    const report = await Report.create({
      reporterId: req.user.id,
      targetId,
      targetType,
      reason,
    });

    // Notify all admins
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      for (const admin of admins) {
        const notification = await Notification.create({
          recipientId: admin._id,
          senderId: req.user.id,
          type: "report",
          title: "New Report Submitted",
          body: `A new ${targetType} report has been filed for ${reason}`,
          link: "/admin/reports",
        });
        emitNotification(admin._id, notification);
      }
    } catch (notifError) {
      logError(notifError);
    }

    res.status(201).json({
      success: true,
      report,
      msg: "Report submitted successfully. An administrator will review it.",
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Failed to submit report" });
  }
};
