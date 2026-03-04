import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "listings",
      required: false,
    },
    content: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    mediaUrl: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ["text", "image", "location"],
      default: "text",
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Index for efficient inquiry tracking and fetching listing messages
messageSchema.index({ listingId: 1, senderId: 1 });

// Index for efficient inbox memory sorting
messageSchema.index({ room: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
