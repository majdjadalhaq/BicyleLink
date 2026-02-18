import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import favoriteRouter from "./routes/Favorite.js";

import userRouter from "./routes/user.js";
import listingRouter from "./routes/listing.js";
import messageRouter from "./routes/message.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/error.js";

// Create an express server
const app = express();

// Security & Logging Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://placehold.co",
          "https://images.unsplash.com",
          "https://via.placeholder.com",
        ],
        "connect-src": ["'self'", "https://api.cloudinary.com"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(morgan("dev"));
app.use(globalLimiter);

// Standard Middleware
// Tell express to use the json middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Routes
/****** Attach routes ******/
/**
 * We use /api/ at the start of every route!
 * As we also host our client code on heroku we want to separate the API endpoints.
 */
app.use("/api/users", userRouter);
app.use("/api/listings", listingRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/messages", messageRouter);

// Error Handling
app.use(errorHandler);

export default app;
