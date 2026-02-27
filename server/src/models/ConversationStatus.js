import mongoose from "mongoose";

const conversationStatusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Compound index for fast lookup per user and room
conversationStatusSchema.index({ userId: 1, room: 1 }, { unique: true });

const ConversationStatus = mongoose.model(
  "ConversationStatus",
  conversationStatusSchema,
);

export default ConversationStatus;
