import Message from "../models/Message.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import { logError } from "../util/logging.js";
import ConversationStatus from "../models/ConversationStatus.js";

export const getMessagesByRoom = async (req, res) => {
  try {
    const { room } = req.params;
    const { limit = 20, before } = req.query;
    const userId = req.user._id;

    const query = { room };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
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

    res.status(200).json({ success: true, result });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to fetch messages" });
  }
};

export const getInbox = async (req, res) => {
  try {
    const userId = req.user._id;
    const { archived = "false" } = req.query;
    const showArchived = archived === "true";

    // Get rooms for this user with matching archived status
    const statuses = await ConversationStatus.find({
      userId,
      isArchived: showArchived,
    }).select("room");
    const targetRooms = statuses.map((s) => s.room);

    // If we're looking for active rooms, we also include rooms that have no status yet
    const query = {
      $or: [{ senderId: userId }, { receiverId: userId }],
    };

    if (showArchived) {
      query.room = { $in: targetRooms };
    } else {
      // For active, we want rooms NOT in the archived list
      const archivedStatuses = await ConversationStatus.find({
        userId,
        isArchived: true,
      }).select("room");
      const archivedRooms = archivedStatuses.map((s) => s.room);
      query.room = { $nin: archivedRooms };
    }

    // Aggregate conversations
    const conversations = await Message.aggregate([
      {
        $match: query,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$room",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const msg = conv.lastMessage;
        const otherUserId =
          msg.senderId.toString() === userId.toString()
            ? msg.receiverId
            : msg.senderId;

        const otherUser = await User.findById(otherUserId).select("name email");

        // Handle Admin Warning messages without a listingId
        let listing;
        if (msg.listingId) {
          listing = await Listing.findById(msg.listingId).select(
            "title images",
          );
        } else {
          listing = {
            _id: "system",
            title: "Administrator Warning",
            images: [
              "https://placehold.co/400x400/6a1b9a/ffffff?text=System+Notice",
            ],
          };
        }

        // Get unread count for this room and user
        const status = await ConversationStatus.findOne({
          userId,
          room: msg.room,
        });
        const lastReadAt = status ? status.lastReadAt : new Date(0);

        const unreadCount = await Message.countDocuments({
          room: msg.room,
          receiverId: userId,
          createdAt: { $gt: lastReadAt },
        });

        return {
          room: msg.room,
          lastMessage: msg,
          otherUser,
          listing,
          unreadCount,
          isArchived: status ? status.isArchived : false,
        };
      }),
    );

    res.status(200).json({ success: true, result: populatedConversations });
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
      { isArchived: status },
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
    const userId = req.user._id;

    // This is more complex because we need the lastReadAt per room
    const statuses = await ConversationStatus.find({ userId });
    let totalUnread = 0;

    // Get all rooms the user is part of
    const rooms = await Message.distinct("room", {
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    for (const room of rooms) {
      const status = statuses.find((s) => s.room === room);
      const lastReadAt = status ? status.lastReadAt : new Date(0);

      const count = await Message.countDocuments({
        room,
        receiverId: userId,
        createdAt: { $gt: lastReadAt },
      });
      totalUnread += count;
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
