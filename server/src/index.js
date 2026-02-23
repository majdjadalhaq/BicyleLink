// Load our .env variables
import dotenv from "dotenv";
import express from "express";
dotenv.config();

import app from "./app.js";
import { logInfo, logError } from "./util/logging.js";

logInfo(" [DEBUG] Index.js loaded. Starting startup sequence...");

import connectDB from "./db/connectDB.js";
import testRouter from "./testRouter.js";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/socketHandler.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);
initSocket(io);

// Check for required environment variables
const requiredEnv = ["JWT_SECRET", "MONGODB_URL", "RESEND_API_KEY"];
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
  const clientDistPath = new URL("../../client/dist", import.meta.url).pathname;

  // Serve static files from the React app
  app.use(express.static(clientDistPath));

  // Explicitly handle favicon.ico to prevent 503s or index.html fallbacks for it
  app.get("/favicon.ico", (req, res) => {
    res.sendFile(`${clientDistPath}/favicon.png`, (err) => {
      if (err) res.status(204).end(); // No content if missing, but no error
    });
  });

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get(/.*/, (req, res) => {
    res.sendFile(`${clientDistPath}/index.html`);
  });
}

/****** For cypress we want to provide an endpoint to seed our data ******/
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", testRouter);
}

// Start the server
startServer();
