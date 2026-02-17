// Load our .env variables
import dotenv from "dotenv";
import express from "express";
dotenv.config();

import app from "./app.js";
import { logInfo, logError } from "./util/logging.js";
import connectDB from "./db/connectDB.js";
import testRouter from "./testRouter.js";
import http from "http";
import { Server } from "socket.io";
import Message from "./models/Message.js";
import ConversationStatus from "./models/ConversationStatus.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Map to track online users (userId -> Set of socketIds)
const onlineUsers = new Map();

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
    } catch (error) {
      logError(error);
    }
  });

  socket.on("typing", (data) => {
    if (!data.room.includes(data.userId)) return;
    socket.to(data.room).emit("typing_status", {
      userId: data.userId,
      isTyping: true,
    });
  });

  socket.on("stop_typing", (data) => {
    if (!data.room.includes(data.userId)) return;
    socket.to(data.room).emit("typing_status", {
      userId: data.userId,
      isTyping: false,
    });
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

// Check for required environment variables
const requiredEnv = [
  "JWT_SECRET",
  "MONGODB_URL",
  "MAILTRAP_USER",
  "MAILTRAP_PASS",
];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `❌ CRITICAL: Missing environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

// The environment should set the port
const port = process.env.PORT;

if (port == null) {
  // If this fails, make sure you have created a `.env` file in the right place with the PORT set
  logError(new Error("Cannot find a PORT number, did you create a .env file?"));
}

const startServer = async () => {
  try {
    await connectDB();
    server.listen(port, () => {
      logInfo(`Server started on port ${port}`);
    });
  } catch (error) {
    logError(error);
  }
};

/****** Host our client code for Heroku *****/
/**
 * We only want to host our client code when in production mode as we then want to use the production build that is built in the dist folder.
 * When not in production, don't host the files, but the development version of the app can connect to the backend itself.
 */
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(new URL("../../client/dist", import.meta.url).pathname),
  );
  // Redirect * requests to give the client data
  app.get("/*file", (req, res) =>
    res.sendFile(
      new URL("../../client/dist/index.html", import.meta.url).pathname,
    ),
  );
}

/****** For cypress we want to provide an endpoint to seed our data ******/
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", testRouter);
}

// Start the server
startServer();
