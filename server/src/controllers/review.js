import mongoose from "mongoose";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import { logError } from "../utils/logging.js";
import Notification from "../models/Notification.js";
import { emitNotification } from "../socket/socketHandler.js";

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/reviews — create a review for a completed transaction
export const createReview = async (req, res) => {
  try {
    const { targetId, listingId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    // Prevent self-review
    if (reviewerId.toString() === targetId) {
      return res
        .status(400)
        .json({ success: false, msg: "You cannot review yourself" });
    }

    // Verify the listing exists and is sold
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    if (listing.status !== "sold") {
      return res.status(400).json({
        success: false,
        msg: "You can only review sold items",
      });
    }

    // Reviewer must be the recorded buyer
    if (
      !listing.buyerId ||
      listing.buyerId.toString() !== reviewerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "You are not the recorded buyer of this item",
      });
    }

    // Target must be the seller (listing owner)
    if (listing.ownerId.toString() !== targetId) {
      return res.status(400).json({
        success: false,
        msg: "The target user is not the seller of this item",
      });
    }

    // Prevent duplicate reviews for the same transaction
    const existingReview = await Review.findOne({ reviewerId, listingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        msg: "You have already reviewed this transaction",
      });
    }

    const review = new Review({
      reviewerId,
      targetId,
      listingId,
      rating,
      comment,
    });
    await review.save();

    const populatedReview = await Review.findById(review._id).populate(
      "reviewerId",
      "name avatarUrl",
    );

    // Atomically update seller's aggregate rating stats
    await User.findByIdAndUpdate(targetId, {
      $inc: { ratingSum: rating, reviewCount: 1 },
    });

    // Create notification for seller
    try {
      const recipient = await User.findById(targetId).select(
        "notificationSettings",
      );

      if (recipient?.notificationSettings?.reviews !== false) {
        const notification = await Notification.create({
          recipientId: targetId,
          senderId: reviewerId,
          type: "review",
          listingId: listingId,
          title: "New Review Received",
          body: `You received a new ${rating}-star review from ${populatedReview.reviewerId.name}`,
          link: `/listings/${listingId}`,
        });
        emitNotification(targetId, notification);
      }
    } catch (notifErr) {
      logError(notifErr);
    }

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to create review" });
  }
};

// GET /api/reviews/user/:userId — paginated reviews for a user
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

    const [reviews, totalCount] = await Promise.all([
      Review.find({ targetId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("reviewerId", "name avatarUrl")
        .populate("listingId", "title"),
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
    res.status(500).json({ success: false, msg: "Unable to get reviews" });
  }
};

// PUT /api/reviews/:id — update a review (validated by middleware)
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

    if (review.reviewerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to update this review",
      });
    }

    let ratingDiff = 0;
    if (rating !== undefined) {
      const newRating = parseInt(rating, 10);
      ratingDiff = newRating - review.rating;
      review.rating = newRating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Adjust seller's aggregate rating sum if rating changed
    if (ratingDiff !== 0) {
      await User.findByIdAndUpdate(review.targetId, {
        $inc: { ratingSum: ratingDiff },
      });
    }

    await review.populate("reviewerId", "name avatarUrl");
    res.status(200).json({ success: true, review });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to update review" });
  }
};

// DELETE /api/reviews/:id — delete a review and update seller stats
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

    if (review.reviewerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to delete this review",
      });
    }

    const { targetId, rating: ratingToRemove } = review;
    await review.deleteOne();

    // Atomically decrement seller's aggregate rating stats
    await User.findByIdAndUpdate(targetId, {
      $inc: { ratingSum: -ratingToRemove, reviewCount: -1 },
    });

    res.status(200).json({ success: true, msg: "Review deleted successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to delete review" });
  }
};

// GET /api/reviews/check — check if the authenticated user has reviewed a listing
export const checkReviewStatus = async (req, res) => {
  try {
    const { listingId } = req.query;
    const reviewerId = req.user._id;

    if (!listingId) {
      return res.status(400).json({ success: false, msg: "Missing listingId" });
    }

    const review = await Review.findOne({ reviewerId, listingId });

    res.status(200).json({
      success: true,
      hasReviewed: !!review,
      reviewId: review ? review._id : null,
    });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to check review status" });
  }
};
