import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authenticate, getMyNotifications);
notificationRouter.get("/unread-count", authenticate, getUnreadCount);
notificationRouter.patch("/read-all", authenticate, markAllAsRead);
notificationRouter.patch("/:id/read", authenticate, markAsRead);

export default notificationRouter;
