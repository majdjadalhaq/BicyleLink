import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import favoriteRouter from "./routes/favorite.js";

import userRouter from "./routes/user.js";
import listingRouter from "./routes/listing.js";
import messageRouter from "./routes/message.js";
import reviewRouter from "./routes/review.js";
import utilsRouter from "./routes/utils.js";
import adminRouter from "./routes/admin.js";
import notificationRouter from "./routes/notification.js";
import reportRouter from "./routes/report.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/error.js";

// Create an express server
const app = express();

// Trust proxy for Heroku/Cloud environments
app.set("trust proxy", 1);

// Security & Logging Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://accounts.google.com/gsi/client"],
        "frame-src": ["'self'", "https://accounts.google.com/gsi/"],
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://placehold.co",
          "https://images.unsplash.com",
          "https://via.placeholder.com",
          "https://static-maps.yandex.ru",
          "https://*.tile.openstreetmap.org",
          "https://www.gstatic.com",
          "https://i.pravatar.cc",
          "https://*.googleusercontent.com",
        ],
        "connect-src": [
          "'self'",
          "https://api.cloudinary.com",
          "https://nominatim.openstreetmap.org",
          "https://accounts.google.com/gsi/",
          "https://c54b.hyf.dev",
        ],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
  }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(globalLimiter);

// Standard Middleware
// Tell express to use the json middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bicyclel.nl",
      "https://www.bicyclel.nl",
    ],
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
app.use("/api/reviews", reviewRouter);
app.use("/api/utils", utilsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/reports", reportRouter);

// Error Handling
app.use(errorHandler);

export default app;
