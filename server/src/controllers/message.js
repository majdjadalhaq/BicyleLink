import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import { logError } from "../utils/logging.js";
import ConversationStatus from "../models/ConversationStatus.js";
import mongoose from "mongoose";
import { getIO } from "../socket/socketHandler.js";

export const getMessagesByRoom = async (req, res) => {
  try {
    const { room } = req.params;
    const { limit = 20, before } = req.query;
    const userId = req.user._id;

    const query = { room };
    if (before && before !== "undefined") {
      const date = new Date(before);
      if (!isNaN(date.getTime())) {
        query.createdAt = { $lt: date };
      }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // Sort latest first for pagination
      .limit(parseInt(limit))
      .populate("senderId", "name");

    // Reverse to return chronological order
    const result = messages.reverse();

    // Update conversation status: lastReadAt and ensure it's not archived for this user
    await ConversationStatus.findOneAndUpdate(
      { userId, room },
      { lastReadAt: new Date(), isArchived: false },
      { upsert: true },
    );

    // Sync Notifications: Mark "message" notifications for this room as read
    if (room.startsWith("admin-warning-")) {
      await Notification.updateMany(
        { recipientId: userId, type: "message", read: false },
        { read: true },
      );
    } else {
      const roomIdParts = room.split("_");
      // Format: listingId_user1_user2
      if (roomIdParts.length === 3) {
        const listingId = roomIdParts[0];
        const otherUserId = roomIdParts.find(
          (id) =>
            id !== userId.toString() && mongoose.Types.ObjectId.isValid(id),
        );

        if (mongoose.Types.ObjectId.isValid(listingId)) {
          await Notification.updateMany(
            {
              recipientId: userId,
              listingId,
              senderId: otherUserId,
              type: "message",
              read: false,
            },
            { read: true },
          );
        }
      }
    }

    const io = getIO();
    if (io) {
      io.to(`user_${userId}`).emit("notifications_updated");
      io.to(`user_${userId}`).emit("messages_read", { room });
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to fetch messages" });
  }
};

export const getInbox = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { archived = "false" } = req.query;
    const showArchived = archived === "true";

    // Determine which rooms to show vs hide
    const hiddenStatuses = await ConversationStatus.find({
      userId,
      $or: [{ isArchived: !showArchived }, { isDeleted: true }],
    }).select("room");
    const hiddenRooms = hiddenStatuses.map((s) => s.room);

    const archivedStatuses = await ConversationStatus.find({
      userId,
      isArchived: true,
      isDeleted: false,
    }).select("room");
    const archivedRooms = archivedStatuses.map((s) => s.room);

    const roomFilter = showArchived
      ? { $in: archivedRooms }
      : { $nin: hiddenRooms };

    // Single aggregate: group by room, get last message, then lookup user + listing + unread
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
          room: roomFilter,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$room",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      // Lookup other user details
      {
        $lookup: {
          from: "users",
          let: {
            senderId: "$lastMessage.senderId",
            receiverId: "$lastMessage.receiverId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$_id", userId] },
                    {
                      $or: [
                        { $eq: ["$_id", "$$senderId"] },
                        { $eq: ["$_id", "$$receiverId"] },
                      ],
                    },
                  ],
                },
              },
            },
            { $project: { name: 1, email: 1, avatarUrl: 1, avatar: 1 } },
            { $limit: 1 },
          ],
          as: "otherUserArr",
        },
      },
      // Lookup listing details
      {
        $lookup: {
          from: "listings",
          let: { listingId: "$lastMessage.listingId" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$listingId"] } },
            },
            { $project: { title: 1, images: 1 } },
            { $limit: 1 },
          ],
          as: "listingArr",
        },
      },
      // Lookup conversation status for this user+room
      {
        $lookup: {
          from: "conversationstatuses",
          let: { room: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", userId] },
                    { $eq: ["$room", "$$room"] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "statusArr",
        },
      },
    ]);

    // Compute unread counts in a single batch query
    const roomNames = conversations.map((c) => c._id);
    const statusDocs = await ConversationStatus.find({
      userId,
      room: { $in: roomNames },
    }).select("room lastReadAt");
    const statusByRoom = Object.fromEntries(
      statusDocs.map((s) => [s.room, s.lastReadAt]),
    );

    const unreadAgg = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          room: { $in: roomNames },
        },
      },
      {
        $group: {
          _id: "$room",
          msgs: { $push: "$createdAt" },
        },
      },
    ]);
    const unreadByRoom = {};
    for (const row of unreadAgg) {
      const lastRead = statusByRoom[row._id] ?? new Date(0);
      unreadByRoom[row._id] = row.msgs.filter(
        (d) => new Date(d) > new Date(lastRead),
      ).length;
    }

    const result = conversations.map((conv) => {
      const msg = conv.lastMessage;
      const status = conv.statusArr[0] ?? null;
      let otherUser = conv.otherUserArr[0] ?? null;

      const isAdminWarning = msg.room.startsWith("admin-warning-");

      const listing = isAdminWarning
        ? {
            _id: "system",
            title: "Administrator Warning",
            images: [
              "https://placehold.co/400x400/6a1b9a/ffffff?text=System+Notice",
            ],
          }
        : (conv.listingArr[0] ?? {
            _id: "deleted",
            title: "Listing Removed",
            images: ["https://placehold.co/400x400/eeeeee/999999?text=N/A"],
          });

      // Mask admin identity for the user
      if (isAdminWarning) {
        otherUser = {
          _id: "system",
          name: "BiCycleL Team",
          avatarUrl: "https://placehold.co/100x100/10B77F/ffffff?text=BC",
        };
      }

      return {
        room: msg.room,
        lastMessage: msg,
        otherUser,
        listing,
        unreadCount: unreadByRoom[msg.room] ?? 0,
        isArchived: status ? status.isArchived : false,
      };
    });

    res.status(200).json({ success: true, result });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to fetch inbox" });
  }
};

export const archiveRoom = async (req, res) => {
  try {
    const { room } = req.params;
    const { status = true } = req.body; // Default to archiving
    const userId = req.user._id;

    await ConversationStatus.findOneAndUpdate(
      { userId, room },
      { isArchived: status, isDeleted: false },
      { upsert: true },
    );

    res.status(200).json({
      success: true,
      msg: status ? "Conversation archived" : "Conversation unarchived",
    });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to update archive status" });
  }
};

export const getUnreadTotal = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Fetch all conversation statuses for this user (lastReadAt per room)
    const statuses = await ConversationStatus.find({ userId }).select(
      "room lastReadAt",
    );
    const statusByRoom = Object.fromEntries(
      statuses.map((s) => [s.room, s.lastReadAt ?? new Date(0)]),
    );

    // Get all rooms the user is part of
    const rooms = await Message.distinct("room", {
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    if (rooms.length === 0) {
      return res.status(200).json({ success: true, result: 0 });
    }

    // Single aggregate across all rooms — count messages newer than lastReadAt per room
    const agg = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          room: { $in: rooms },
        },
      },
      {
        $group: {
          _id: "$room",
          messages: { $push: "$createdAt" },
        },
      },
    ]);

    let totalUnread = 0;
    for (const row of agg) {
      const lastRead = statusByRoom[row._id] ?? new Date(0);
      totalUnread += row.messages.filter(
        (d) => new Date(d) > new Date(lastRead),
      ).length;
    }

    res.status(200).json({ success: true, result: totalUnread });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to fetch unread total" });
  }
};

export const markRoomUnread = async (req, res) => {
  try {
    const { room } = req.params;
    const userId = req.user._id;

    // Set lastReadAt to the beginning of time to make all messages unread
    // or we could find the latest message and set it just before that.
    // For simplicity, using a very old date.
    await ConversationStatus.findOneAndUpdate(
      { userId, room },
      { lastReadAt: new Date(0) },
      { upsert: true },
    );

    res
      .status(200)
      .json({ success: true, msg: "Conversation marked as unread" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to mark as unread" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { room } = req.params;
    const userId = req.user._id;

    await ConversationStatus.findOneAndUpdate(
      { userId, room },
      { isDeleted: true, isArchived: false },
      { upsert: true },
    );

    res.status(200).json({ success: true, msg: "Conversation deleted" });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to delete conversation" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ success: false, msg: "Content is required" });
    }

    const message = await Message.findOne({ _id: messageId, senderId: userId });
    if (!message) {
      return res
        .status(404)
        .json({ success: false, msg: "Message not found or unauthorized" });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    res.status(200).json({ success: true, result: message });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to edit message" });
  }
};
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({ _id: messageId, senderId: userId });
    if (!message) {
      return res
        .status(404)
        .json({ success: false, msg: "Message not found or unauthorized" });
    }

    message.isDeleted = true;
    message.content = "";
    await message.save();

    // Broadcast deletion to the room in real time
    const io = getIO();
    if (io) {
      io.to(message.room).emit("message_deleted", messageId);
    }

    res.status(200).json({ success: true, result: message });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to delete message" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await ConversationStatus.updateMany({ userId }, { lastReadAt: new Date() });

    // Mark ALL message notifications as read
    await Notification.updateMany(
      { recipientId: userId, type: "message", read: false },
      { read: true },
    );

    const io = getIO();
    if (io) {
      io.to(`user_${userId}`).emit("messages_read", { room: "all" });
      io.to(`user_${userId}`).emit("notifications_updated");
    }

    res
      .status(200)
      .json({ success: true, msg: "All conversations marked as read" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to mark all as read" });
  }
};
