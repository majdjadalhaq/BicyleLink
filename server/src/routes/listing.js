import express from "express";
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listing.js";

const listingRouter = express.Router();

// GET /api/listings - Get all listings
listingRouter.get("/", getListings);

// GET /api/listings/:id - Get single listing
listingRouter.get("/:id", getListingById);

// POST /api/listings - Create a new listing
listingRouter.post("/", createListing);

// PUT /api/listings/:id - Update listing
listingRouter.put("/:id", updateListing);

// DELETE /api/listings/:id - Delete listing
listingRouter.delete("/:id", deleteListing);

export default listingRouter;
