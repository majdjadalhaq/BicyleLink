import express from "express";
import { authenticate } from "../middleware/auth.js";
import { reviewValidation } from "../middleware/reviewValidation.js";
import {
  createReview,
  getReviewsByUser,
  updateReview,
  deleteReview,
  checkReviewStatus,
} from "../controllers/review.js";

const reviewRouter = express.Router();

// POST /api/reviews - Create a review (authenticated, validated)
reviewRouter.post(
  "/",
  authenticate,
  reviewValidation.createRules,
  createReview,
);

// GET /api/reviews/user/:userId - Get reviews for a user (public)
reviewRouter.get("/user/:userId", getReviewsByUser);

// PUT /api/reviews/:id - Update a review (authenticated, validated)
reviewRouter.put(
  "/:id",
  authenticate,
  reviewValidation.updateRules,
  updateReview,
);

// DELETE /api/reviews/:id - Delete a review (authenticated)
reviewRouter.delete("/:id", authenticate, deleteReview);

// GET /api/reviews/check - Check if user has already reviewed a listing (authenticated)
reviewRouter.get("/check", authenticate, checkReviewStatus);

export default reviewRouter;
