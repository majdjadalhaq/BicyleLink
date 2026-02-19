import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "listings",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only review a listing once
reviewSchema.index({ reviewerId: 1, listingId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
