import mongoose from "mongoose";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import { logError } from "../util/logging.js";

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST create a review
export const createReview = async (req, res) => {
  try {
    const { targetId, listingId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    // 1. Basic Validation
    if (!targetId) {
      return res
        .status(400)
        .json({ success: false, msg: "Missing required field: targetId" });
    }
    if (!listingId) {
      return res
        .status(400)
        .json({ success: false, msg: "Missing required field: listingId" });
    }
    if (!rating) {
      return res
        .status(400)
        .json({ success: false, msg: "Missing required field: rating" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, msg: "Rating must be between 1 and 5" });
    }

    if (reviewerId.toString() === targetId) {
      return res
        .status(400)
        .json({ success: false, msg: "You cannot review yourself" });
    }

    // 2. Verify the Transaction
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    // Ensure listing is sold
    if (listing.status !== "sold") {
      return res.status(400).json({
        success: false,
        msg: "You can only review sold items",
      });
    }

    // Ensure the reviewer is the recorded buyer
    if (
      !listing.buyerId ||
      listing.buyerId.toString() !== reviewerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "You are not the recorded buyer of this item",
      });
    }

    // Ensure the target is the seller (owner)
    if (listing.ownerId.toString() !== targetId) {
      return res.status(400).json({
        success: false,
        msg: "The target user is not the seller of this item",
      });
    }

    // 3. Check for existing review
    const existingReview = await Review.findOne({ reviewerId, listingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        msg: "You have already reviewed this transaction",
      });
    }

    // 4. Create Review
    const review = new Review({
      reviewerId,
      targetId,
      listingId,
      rating,
      comment,
    });

    await review.save();

    // Populate the newly created review before sending it
    const populatedReview = await Review.findById(review._id).populate(
      "reviewerId",
      "name avatarUrl",
    );

    // 5. Update User Stats (Atomic increment)
    await User.findByIdAndUpdate(targetId, {
      $inc: { ratingSum: rating, reviewCount: 1 },
    });

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to create review",
    });
  }
};

// GET reviews for a user
export const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, msg: "Invalid user ID" });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get reviews where user is the target
    const [reviews, totalCount] = await Promise.all([
      Review.find({ targetId: userId })
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limitNum)
        .populate("reviewerId", "name avatarUrl")
        .populate("listingId", "title"), // Context
      Review.countDocuments({ targetId: userId }),
    ]);

    res.status(200).json({
      success: true,
      result: reviews,
      totalCount,
      page: pageNum,
      hasMore: skip + reviews.length < totalCount,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to get reviews",
    });
  }
};

// PUT update a review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, msg: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, msg: "Review not found" });
    }

    // Check ownership
    if (review.reviewerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to update this review",
      });
    }

    // Validate new rating if provided
    let ratingDiff = 0;
    if (rating !== undefined) {
      const newRating = parseInt(rating, 10);
      if (isNaN(newRating) || newRating < 1 || newRating > 5) {
        return res
          .status(400)
          .json({ success: false, msg: "Rating must be between 1 and 5" });
      }
      ratingDiff = newRating - review.rating;
      review.rating = newRating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Update User Stats if rating changed
    if (ratingDiff !== 0) {
      await User.findByIdAndUpdate(review.targetId, {
        $inc: { ratingSum: ratingDiff },
      });
    }

    await review.populate("reviewerId", "name avatarUrl");
    res.status(200).json({ success: true, review });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to update review",
    });
  }
};

// DELETE a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, msg: "Invalid review ID" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, msg: "Review not found" });
    }

    // Check ownership
    // Allow admins to delete? For now, only owner.
    if (review.reviewerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to delete this review",
      });
    }

    const targetId = review.targetId;
    const ratingToRemove = review.rating;

    await review.deleteOne();

    // Update User Stats (Atomic decrement)
    await User.findByIdAndUpdate(targetId, {
      $inc: { ratingSum: -ratingToRemove, reviewCount: -1 },
    });

    res.status(200).json({ success: true, msg: "Review deleted successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to delete review",
    });
  }
};

// GET check if user has reviewed a listing
export const checkReviewStatus = async (req, res) => {
  try {
    const { listingId } = req.query;
    const reviewerId = req.user._id;

    if (!listingId) {
      return res.status(400).json({ success: false, msg: "Missing listingId" });
    }

    const review = await Review.findOne({ reviewerId, listingId });

    if (review) {
      return res.status(200).json({
        success: true,
        hasReviewed: true,
        reviewId: review._id,
      });
    }

    return res.status(200).json({
      success: true,
      hasReviewed: false,
      reviewId: null,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to check review status",
    });
  }
};
