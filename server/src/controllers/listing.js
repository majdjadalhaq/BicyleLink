import mongoose from "mongoose";

import Listing, { validateListing } from "../models/Listing.js";
import { logError } from "../util/logging.js";
import validationErrorMessage from "../util/validationErrorMessage.js";

// Helper to escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to check if value is a plain object (not null, not array)
const isPlainObject = (val) =>
  val != null && typeof val === "object" && !Array.isArray(val);

// Allowed fields for updates/creation to prevent pollution
const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "price",
  "images",
  "location",
  "brand",
  "model",
  "year",
  "condition",
  "mileage",
  "status", // User might be allowed to change status
];

// GET all listings
export const getListings = async (req, res) => {
  try {
    const { status, location } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (location)
      filter.location = { $regex: escapeRegex(location), $options: "i" };

    const listings = await Listing.find(filter).populate(
      "ownerId",
      "name email",
    );
    res.status(200).json({ success: true, result: listings });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to get listings, try again later" });
  }
};

// GET single listing by ID
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid listing ID" });
    }

    const listing = await Listing.findById(id).populate(
      "ownerId",
      "name email",
    );

    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    res.status(200).json({ success: true, result: listing });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to get listing, try again later" });
  }
};

// POST create new listing
export const createListing = async (req, res) => {
  try {
    const listingData = req.body?.listing;

    if (!isPlainObject(listingData)) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide a 'listing' object.",
      });
    }

    // Explicitly pick allowed fields
    const safeListing = {};
    ALLOWED_UPDATE_FIELDS.forEach((field) => {
      if (listingData[field] !== undefined) {
        safeListing[field] = listingData[field];
      }
    });

    const errorList = validateListing(safeListing);

    if (errorList.length > 0) {
      return res
        .status(400)
        .json({ success: false, msg: validationErrorMessage(errorList) });
    }

    // Ensure request is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        msg: "Authentication required",
      });
    }

    // Set ownerId from authenticated user
    safeListing.ownerId = req.user._id;

    const newListing = await Listing.create(safeListing);
    res.status(201).json({ success: true, listing: newListing });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to create listing, try again later",
    });
  }
};

// PUT update listing
export const updateListing = async (req, res) => {
  try {
    const updates = req.body?.listing;

    if (!isPlainObject(updates)) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide a 'listing' object with updates.",
      });
    }

    // Ownership is already checked by middleware (requireOwnership)
    // req.resource contains the listing

    // Whitelist updates
    const safeUpdates = {};
    ALLOWED_UPDATE_FIELDS.forEach((field) => {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    });

    // Use findByIdAndUpdate on req.resource._id to apply updates and validators
    const listing = await Listing.findByIdAndUpdate(
      req.resource._id,
      safeUpdates,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({ success: true, listing });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to update listing, try again later",
    });
  }
};

// DELETE listing
export const deleteListing = async (req, res) => {
  try {
    // Ownership is already checked by middleware
    await Listing.findByIdAndDelete(req.resource._id);

    res
      .status(200)
      .json({ success: true, msg: "Listing deleted successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to delete listing, try again later",
    });
  }
};
