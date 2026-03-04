import mongoose from "mongoose";
import Message from "../models/Message.js";
import Listing from "../models/Listing.js";
import ConversationStatus from "../models/ConversationStatus.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { logError } from "../utils/logging.js";

import jwt from "jsonwebtoken";

const onlineUsers = new Map();
let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  // --- Socket JWT Authentication Middleware ---
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.request.headers.cookie;
      if (!rawCookie) {
        return next(new Error("Authentication error: No cookies found"));
      }

      // Parse cookie string
      const cookies = rawCookie.split(";").reduce((res, item) => {
        const data = item.trim().split("=");
        if (data.length === 2) {
          res[data[0]] = data[1];
        }
        return res;
      }, {});

      const token = cookies.token;
      if (!token) {
        return next(new Error("Authentication error: Missing token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // DB connection check for block status
      const user = await User.findById(decoded.id).select("isBlocked");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }
      if (user.isBlocked) {
        return next(new Error("Authentication error: User is blocked"));
      }

      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });
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
    // Current user id verified from JWT token during connection
    const currentUserId = socket.data.userId;

    socket.on("join_room", (data) => {
      // data can be just room string or { room }
      const room = typeof data === "string" ? data : data.room;

      // Security check: Room ID format is listingId_userId1_userId2
      // User can only join if their ID is part of the room string
      if (currentUserId && !room.includes(currentUserId)) {
        logError(
          new Error(
            `Unauthorized room join attempt: User ${currentUserId} -> Room ${room}`,
          ),
        );
        return;
      }

      socket.join(room);

      if (currentUserId) {
        // Join personal room for app-wide notifications (Inbox, etc.)
        socket.join(`user_${currentUserId}`);

        if (!onlineUsers.has(currentUserId)) {
          onlineUsers.set(currentUserId, new Set());
          // Notify shared contacts about new online status
          broadcastUserStatus(currentUserId, "online");
        }
        onlineUsers.get(currentUserId).add(socket.id);
      }
    });

    socket.on("send_message", async (msg) => {
      try {
        // Overwrite client-provided senderId with verified socket userId
        msg.senderId = currentUserId;

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
        io.to(`user_${msg.receiverId}`).emit("receive_message", savedMessage);

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
        const receiver = await mongoose
          .model("users")
          .findById(msg.receiverId)
          .select("notificationSettings");

        if (receiver?.notificationSettings?.messages !== false) {
          const notification = await Notification.create({
            recipientId: msg.receiverId,
            senderId: msg.senderId,
            listingId: msg.listingId,
            type: "message",
            title: "New message",
            body:
              msg.content.length > 50
                ? `${msg.content.substring(0, 47)}...`
                : msg.content,
            link: "/inbox",
            read: false,
          });

          // Emit real-time notification to the receiver's personal room
          io.to(`user_${msg.receiverId}`).emit(
            "new_notification",
            notification,
          );
        }
      } catch (error) {
        logError(error);
      }
    });

    socket.on("typing", (data) => {
      // Use verified user ID
      const verifiedUserId = currentUserId;

      if (!data.room.includes(verifiedUserId)) return;

      // Broadcast to the chat room
      socket.to(data.room).emit("typing_status", {
        userId: verifiedUserId,
        isTyping: true,
        room: data.room, // Include room so Inbox knows which chat is typing
      });

      // Also broadcast to the other user's personal room for Inbox indicators
      const parts = data.room.split("_");
      const otherUserId = parts[1] === verifiedUserId ? parts[2] : parts[1];
      if (otherUserId) {
        socket.to(`user_${otherUserId}`).emit("typing_status", {
          userId: data.userId,
          isTyping: true,
          room: data.room,
        });
      }
    });

    socket.on("stop_typing", (data) => {
      if (!data.room.includes(currentUserId)) return;

      socket.to(data.room).emit("typing_status", {
        userId: currentUserId,
        isTyping: false,
        room: data.room,
      });

      const parts = data.room.split("_");
      const otherUserId = parts[1] === currentUserId ? parts[2] : parts[1];
      if (otherUserId) {
        socket.to(`user_${otherUserId}`).emit("typing_status", {
          userId: currentUserId,
          isTyping: false,
          room: data.room,
        });
      }
    });

    socket.on("read_room", (data) => {
      // Broadcast back to the user's personal room to trigger UI sync in other tabs/Nav
      io.to(`user_${currentUserId}`).emit("messages_read", { room: data.room });
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
          room: { $regex: String(targetUserId) },
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

export const getIO = () => ioInstance;

export const emitNotification = (recipientId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user_${recipientId}`).emit("new_notification", notification);
  }
};
