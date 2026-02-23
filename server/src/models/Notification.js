import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // e.g. "message", "favorite", "review"
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    // frontend route
    link: { type: String, default: "/" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
