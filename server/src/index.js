// Load .env before anything else
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import app from "./app.js";
import { logInfo, logError } from "./utils/logging.js";
import connectDB from "./db/connectDB.js";
import testRouter from "./testRouter.js";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/socketHandler.js";
import { ALLOWED_ORIGINS } from "./config/allowedOrigins.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
});

app.set("io", io);
initSocket(io);

// Check for required environment variables
const requiredEnv = ["JWT_SECRET", "MONGODB_URL", "RESEND_API_KEY"];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  logError(
    new Error(
      `❌ CRITICAL: Missing environment variables: ${missing.join(", ")}`,
    ),
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

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/****** Host our client code for Heroku *****/
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
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

/****** For cypress we want to provide an endpoint to seed our data ******/
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", testRouter);
}

// Start the server
startServer();
