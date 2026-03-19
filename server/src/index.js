// Load .env before anything else
import dotenv from "dotenv";
dotenv.config();

import { logInfo, logError } from "./utils/logging.js";

// Handle uncaught exceptions and rejections for better production debugging
process.on("uncaughtException", (err) => {
  logError(err, "UNCAUGHT EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logError(err.stack);
  process.exit(1);
});

logInfo("Starting application...");

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./db/connectDB.js";
import testRouter from "./testRouter.js";
import { initSocket } from "./socket/socketHandler.js";
import { ALLOWED_ORIGINS } from "./config/allowedOrigins.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
});

app.set("io", io);
initSocket(io);

// Check for required environment variables at startup
const requiredEnv = ["JWT_SECRET", "MONGODB_URL", "RESEND_API_KEY"];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  const errorMsg = `❌ CRITICAL STARTUP FAILURE: Missing environment variables: ${missing.join(", ")}`;
  console.error(errorMsg); // Use console directly for immediate visibility
  logError(errorMsg);
  process.exit(1);
}

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(port, () => {
      logInfo(`Server started on port ${port}`);
    });
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

/****** Host our client code for Heroku/Render *****/
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.resolve(__dirname, "../../client/dist");

  // Serve static files from the React app
  app.use(express.static(clientDistPath));

  // Explicitly handle favicon.ico
  app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(clientDistPath, "favicon.png"), (err) => {
      if (err) res.status(204).end();
    });
  });

  // Catch-all handler for SPA (Express 5 compatibility)
  // Express 5 / path-to-regexp v8 requires a named parameter for wildcards
  app.get("/:path*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

/****** For testing we provide an endpoint to seed our data ******/
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", testRouter);
}

// Start the server
startServer();
