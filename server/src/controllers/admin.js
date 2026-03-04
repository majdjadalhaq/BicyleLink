import mongoose from "mongoose";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import Message from "../models/Message.js";
import { logError } from "../utils/logging.js";
import { getIO } from "../socket/socketHandler.js";
import { ALLOWED_LISTING_WRITE_FIELDS } from "../utils/listingConstants.js";

// Helper to check if value is a non-null, non-array object
const isPlainObject = (val) =>
  val != null && typeof val === "object" && !Array.isArray(val);

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const featuredListings = await Listing.countDocuments({ isFeatured: true });

    // Get metrics over the last 7 days for the graph
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentListingsRaw = await Listing.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Pad the data so we always have the last 7 days on the graph
    const recentListings = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Format as YYYY-MM-DD in local time to match what MongoDB produces
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const found = recentListingsRaw.find((item) => item._id === dateStr);
      recentListings.push({
        _id: dateStr,
        count: found ? found.count : 0,
      });
    }

    const pendingReports = await Report.countDocuments({ status: "pending" });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        featuredListings,
        pendingReports,
        recentListings,
      },
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to retrieve stats" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select("-password -verificationCode -securityCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to retrieve users" });
  }
};

export const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Prevent removing your own admin rights accidentally
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, msg: "Cannot change your own role" });
    }

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to change user role" });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Prevent blocking yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, msg: "Cannot block yourself" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    if (user.isBlocked) {
      const io = getIO();
      if (io) {
        io.in(`user_${user._id.toString()}`).disconnectSockets(true);
      }
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to toggle block status" });
  }
};

export const toggleUserVerify = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to toggle verify status" });
  }
};

export const sendAdminWarning = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (!message || message.trim() === "") {
      return res
        .status(400)
        .json({ success: false, msg: "Warning message cannot be empty" });
    }

    // A unique room for admin warnings for this specific user
    const room = `admin-warning-${user._id.toString()}`;

    // Create a warning message
    const savedMessage = await Message.create({
      senderId: req.user._id,
      receiverId: user._id,
      content: message,
      room,
      read: false,
    });

    // Notify the user in real-time if they are online
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${user._id}`).emit("receive_message", savedMessage);
    }

    res
      .status(200)
      .json({ success: true, msg: "Admin warning sent successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to send warning" });
  }
};

export const getListings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find()
        .populate("ownerId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      listings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to retrieve listings" });
  }
};

export const toggleListingFeatured = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    listing.isFeatured = !listing.isFeatured;
    await listing.save();

    res.status(200).json({ success: true, listing });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to toggle featured status" });
  }
};

export const deleteListingByAdmin = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ success: true, msg: "Listing deleted successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to delete listing" });
  }
};

const WARNINGS_MAX_LIMIT = 50;

export const getAdminSentWarnings = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(
      WARNINGS_MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit) || 20),
    );

    const warnings = await Message.find({
      receiverId: id,
      room: `admin-warning-${id}`,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("content createdAt read")
      .lean();

    res.status(200).json({ success: true, warnings });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to fetch warnings" });
  }
};

export const updateListingByAdmin = async (req, res) => {
  try {
    const updates = req.body?.listing;
    const { id } = req.params;

    if (!isPlainObject(updates)) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide a 'listing' object with updates.",
      });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    // Use shared ALLOWED_LISTING_WRITE_FIELDS from listingConstants.js
    ALLOWED_LISTING_WRITE_FIELDS.forEach((field) => {
      if (updates[field] !== undefined) {
        listing[field] = updates[field];
      }
    });

    await listing.save();
    res.status(200).json({ success: true, listing });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to update listing" });
  }
};

export const getReportsByAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const reports = await Report.find()
      .populate("reporterId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments();

    // Manual population for targetId since it can be multiple models
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        let target = null;
        if (report.targetType === "Listing") {
          target = await Listing.findById(report.targetId).select(
            "title images",
          );
        } else if (report.targetType === "User") {
          target = await User.findById(report.targetId).select(
            "name email avatarUrl",
          );
        }
        return { ...report.toObject(), target };
      }),
    );

    res.status(200).json({
      success: true,
      reports: populatedReports,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to retrieve reports" });
  }
};

export const updateReportStatusByAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid report ID" });
    }

    if (!["pending", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ success: false, msg: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate("reporterId", "name email");

    if (!report) {
      return res.status(404).json({ success: false, msg: "Report not found" });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to update report status" });
  }
};
