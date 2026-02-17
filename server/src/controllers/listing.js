import mongoose from "mongoose";

import Listing from "../models/Listing.js";
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
    const { status, location, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (location)
      filter.location = { $regex: escapeRegex(location), $options: "i" };

    if (search) {
      const searchRegex = { $regex: escapeRegex(search), $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { brand: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [listings, totalCount] = await Promise.all([
      Listing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("ownerId", "name email"),
      Listing.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      result: listings,
      totalCount,
      page: pageNum,
      hasMore: skip + listings.length < totalCount,
    });
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

    // Set ownerId from authenticated user
    safeListing.ownerId = req.user._id;

    // Create instance to run Mongoose validators
    const listing = new Listing(safeListing);
    const validationError = listing.validateSync();

    if (validationError) {
      const errors = Object.values(validationError.errors).map(
        (err) => err.message,
      );
      return res.status(400).json({
        success: false,
        msg: validationErrorMessage(errors),
      });
    }

    await listing.save();
    res.status(201).json({ success: true, listing });
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
    // req.resource contains the existing listing

    // Whitelist updates
    ALLOWED_UPDATE_FIELDS.forEach((field) => {
      if (updates[field] !== undefined) {
        req.resource[field] = updates[field];
      }
    });

    // Save will trigger Mongoose validators
    await req.resource.save();

    res.status(200).json({ success: true, listing: req.resource });
  } catch (error) {
    // Check if it's a Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        msg: validationErrorMessage(errors),
      });
    }

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

// PATCH update listing status (e.g. mark as sold)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "sold", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, msg: "Invalid status" });
    }

    // Ownership is already checked by middleware
    req.resource.status = status;
    await req.resource.save();

    res.status(200).json({
      success: true,
      msg: `Listing marked as ${status}`,
      listing: req.resource,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to update status, try again later",
    });
  }
};
