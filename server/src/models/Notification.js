import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "listings",
    },
    type: {
      type: String,
      enum: ["message", "favorite"],
      required: true,
    },
    title: { type: String },
    body: { type: String },
    link: { type: String, default: "/" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Notification =
  mongoose.models.notifications ||
  mongoose.model("notifications", notificationSchema);

export default Notification;
