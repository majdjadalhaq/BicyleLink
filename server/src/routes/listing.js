import express from "express";
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  updateStatus,
  getListingFacets,
  getCandidates,
} from "../controllers/listing.js";
import {
  authenticate,
  requireVerified,
  requireOwnership,
  optionalAuth,
} from "../middleware/auth.js";
import Listing from "../models/Listing.js";

const listingRouter = express.Router();

// GET /api/listings - Get all listings (public, but optional auth for user context if needed later)
listingRouter.get("/", optionalAuth, getListings);

// GET /api/listings/facets - Get filter statistics (Must be before /:id)
listingRouter.get("/facets", getListingFacets);

// GET /api/listings/:id/candidates - Get potential buyers (requires ownership logic in controller)
listingRouter.get(
  "/:id/candidates",
  authenticate,
  requireVerified,
  getCandidates,
);

// GET /api/listings/:id - Get single listing
listingRouter.get("/:id", optionalAuth, getListingById);

// POST /api/listings - Create a new listing (requires authentication & verification)
listingRouter.post("/", authenticate, requireVerified, createListing);

// PUT /api/listings/:id - Update listing (requires ownership)
listingRouter.put(
  "/:id",
  authenticate,
  requireVerified,
  requireOwnership(Listing),
  updateListing,
);

// DELETE /api/listings/:id - Delete listing (requires ownership)
listingRouter.delete(
  "/:id",
  authenticate,
  requireVerified,
  requireOwnership(Listing),
  deleteListing,
);

// PATCH /api/listings/:id/status - Update listing status (requires ownership)
listingRouter.patch(
  "/:id/status",
  authenticate,
  requireVerified,
  requireOwnership(Listing),
  updateStatus,
);

export default listingRouter;
