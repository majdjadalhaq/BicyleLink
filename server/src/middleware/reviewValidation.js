import { body } from "express-validator";
import handleValidationErrors from "./handleValidationErrors.js";

/**
 * Validation rules for creating a review.
 * Apply as route middleware: router.post("/", authenticate, reviewValidation.createRules, createReview)
 */
const createRules = [
  body("targetId")
    .notEmpty()
    .withMessage("targetId is required")
    .isMongoId()
    .withMessage("targetId must be a valid ID"),

  body("listingId")
    .notEmpty()
    .withMessage("listingId is required")
    .isMongoId()
    .withMessage("listingId must be a valid ID"),

  body("rating")
    .notEmpty()
    .withMessage("rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),

  body("comment")
    .optional()
    .isString()
    .withMessage("comment must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),

  handleValidationErrors,
];

/**
 * Validation rules for updating a review.
 * At least one of rating or comment must be provided.
 */
const updateRules = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),

  body("comment")
    .optional()
    .isString()
    .withMessage("comment must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),

  // At least one field must be present
  body().custom((_, { req }) => {
    const { rating, comment } = req.body;
    if (rating === undefined && comment === undefined) {
      throw new Error(
        "At least one field (rating or comment) must be provided",
      );
    }
    return true;
  }),

  handleValidationErrors,
];

export const reviewValidation = { createRules, updateRules };
