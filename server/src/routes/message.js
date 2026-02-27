import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getMessagesByRoom,
  getInbox,
  archiveRoom,
  getUnreadTotal,
  markRoomUnread,
  deleteConversation,
  editMessage,
  markAllRead,
} from "../controllers/message.js";

const messageRouter = express.Router();

messageRouter.get("/inbox", authenticate, getInbox);
messageRouter.get("/unread-total", authenticate, getUnreadTotal);
messageRouter.post("/archive/:room", authenticate, archiveRoom);
messageRouter.post("/unread/:room", authenticate, markRoomUnread);
messageRouter.delete("/:room", authenticate, deleteConversation);
messageRouter.put("/:messageId", authenticate, editMessage);
messageRouter.post("/read-all", authenticate, markAllRead);
messageRouter.get("/:room", authenticate, getMessagesByRoom);

export default messageRouter;
