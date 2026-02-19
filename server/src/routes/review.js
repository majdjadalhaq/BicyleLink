import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createReview,
  getReviewsByUser,
  updateReview,
  deleteReview,
  checkReviewStatus,
} from "../controllers/review.js";

const reviewRouter = express.Router();

// POST /api/reviews - Create a review (Authenticated)
reviewRouter.post("/", authenticate, createReview);

// GET /api/reviews/user/:userId - Get reviews for a user (Public)
reviewRouter.get("/user/:userId", getReviewsByUser);
// PUT /api/reviews/:id - Update a review (Authenticated owner)
reviewRouter.put("/:id", authenticate, updateReview);

// DELETE /api/reviews/:id - Delete a review (Authenticated owner)
reviewRouter.delete("/:id", authenticate, deleteReview);

// GET /api/reviews/check - Check if user has reviewed a listing (Authenticated)
reviewRouter.get("/check", authenticate, checkReviewStatus);

export default reviewRouter;
