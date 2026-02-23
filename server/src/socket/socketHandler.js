import Message from "../models/Message.js";
import Listing from "../models/Listing.js";
import ConversationStatus from "../models/ConversationStatus.js";
import Notification from "../models/Notification.js";
import { logError } from "../util/logging.js";

const onlineUsers = new Map();

export const initSocket = (io) => {
  const broadcastUserStatus = async (userId, status) => {
    try {
      const statuses = await ConversationStatus.find({ userId });
      statuses.forEach((s) => {
        // Notify the specific chat room
        io.to(s.room).emit("user_status_change", { userId, status });

        // Notify the other user's personal room for app-wide sync (e.g., Inbox)
        // Room format: listingId_userId1_userId2
        const parts = s.room.split("_");
        const otherUserId = parts[1] === userId ? parts[2] : parts[1];
        if (otherUserId) {
          io.to(`user_${otherUserId}`).emit("user_status_change", {
            userId,
            status,
          });
        }
      });
    } catch (err) {
      logError(err);
    }
  };

  io.on("connection", (socket) => {
    let currentUserId = null;

    socket.on("join_room", (data) => {
      // data can be just room string or { room, userId }
      const { room, userId } = typeof data === "string" ? { room: data } : data;

      // Security check: Room ID format is listingId_userId1_userId2
      // User can only join if their ID is part of the room string
      if (userId && !room.includes(userId)) {
        logError(
          new Error(
            `Unauthorized room join attempt: User ${userId} -> Room ${room}`,
          ),
        );
        return;
      }

      socket.join(room);

      if (userId) {
        currentUserId = userId;
        // Join personal room for app-wide notifications (Inbox, etc.)
        socket.join(`user_${userId}`);

        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
          // Notify shared contacts about new online status
          broadcastUserStatus(userId, "online");
        }
        onlineUsers.get(userId).add(socket.id);
      }
    });

    socket.on("send_message", async (msg) => {
      try {
        // Security Check: Ensure sender is part of the room they are sending to
        if (!msg.room.includes(msg.senderId)) {
          logError(
            new Error(
              `Unauthorized message send: User ${msg.senderId} -> Room ${msg.room}`,
            ),
          );
          return;
        }

        const savedMessage = await Message.create(msg);
        io.to(msg.room).emit("receive_message", savedMessage);

        // --- INQUIRY TRACKING ---
        const listing = await Listing.findById(msg.listingId);
        if (listing && listing.ownerId.toString() !== msg.senderId) {
          // Check if this is the first message from this sender for this listing
          const existingMessages = await Message.countDocuments({
            listingId: msg.listingId,
            senderId: msg.senderId,
            _id: { $ne: savedMessage._id },
          });

          if (existingMessages === 0) {
            // First message from a potential buyer! Increment inquiries.
            await Listing.findByIdAndUpdate(msg.listingId, {
              $inc: { inquiries: 1 },
            });
          }
        }

        // --- NOTIFICATION ---
        // Create notification for receiver
        const notification = await Notification.create({
          userId: msg.receiverId,
          type: "message",
          title: "New message",
          body:
            msg.content.length > 50
              ? `${msg.content.substring(0, 47)}...`
              : msg.content,
          link: "/inbox", // In a future enhancement, this could be /chat/roomID
          read: false,
        });

        // Emit real-time notification to the receiver's personal room
        io.to(`user_${msg.receiverId}`).emit("new_notification", notification);
      } catch (error) {
        logError(error);
      }
    });

    socket.on("typing", (data) => {
      if (!data.room.includes(data.userId)) return;

      // Broadcast to the chat room
      socket.to(data.room).emit("typing_status", {
        userId: data.userId,
        isTyping: true,
        room: data.room, // Include room so Inbox knows which chat is typing
      });

      // Also broadcast to the other user's personal room for Inbox indicators
      const parts = data.room.split("_");
      const otherUserId = parts[1] === data.userId ? parts[2] : parts[1];
      if (otherUserId) {
        socket.to(`user_${otherUserId}`).emit("typing_status", {
          userId: data.userId,
          isTyping: true,
          room: data.room,
        });
      }
    });

    socket.on("stop_typing", (data) => {
      if (!data.room.includes(data.userId)) return;

      socket.to(data.room).emit("typing_status", {
        userId: data.userId,
        isTyping: false,
        room: data.room,
      });

      const parts = data.room.split("_");
      const otherUserId = parts[1] === data.userId ? parts[2] : parts[1];
      if (otherUserId) {
        socket.to(`user_${otherUserId}`).emit("typing_status", {
          userId: data.userId,
          isTyping: false,
          room: data.room,
        });
      }
    });

    socket.on("disconnect", () => {
      if (currentUserId && onlineUsers.has(currentUserId)) {
        onlineUsers.get(currentUserId).delete(socket.id);
        if (onlineUsers.get(currentUserId).size === 0) {
          onlineUsers.delete(currentUserId);
          // Targeted Offline Notification
          broadcastUserStatus(currentUserId, "offline");
        }
      }
    });

    // Helper to check online status (Hardened: only for contacts)
    socket.on("check_online_status", async (targetUserId) => {
      if (!currentUserId) return;
      try {
        // Verify if users share a conversation before disclosing status
        const sharedRoom = await ConversationStatus.findOne({
          userId: currentUserId,
          room: { $regex: targetUserId },
        });

        if (sharedRoom) {
          socket.emit("online_status_result", {
            userId: targetUserId,
            isOnline: onlineUsers.has(targetUserId),
          });
        }
      } catch (err) {
        logError(err);
      }
    });
  });
};
