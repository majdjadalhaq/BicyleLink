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
    const {
      status,
      location,
      search,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      brand,
      category,
      condition,
      sort,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = status
      ? { status }
      : { status: { $in: ["active", "sold"] } };

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

    // --- NEW: Advanced Filters ---
    // 1. Price Range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // 2. Year Range
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = parseInt(minYear, 10);
      if (maxYear) filter.year.$lte = parseInt(maxYear, 10);
    }

    // 3. Multi-Select Filters (Brand, Category, Condition)
    if (brand) {
      // Expecting brand to be a comma-separated string if from query params, or array
      const brands = Array.isArray(brand) ? brand : brand.split(",");
      if (brands.length > 0)
        filter.brand = { $in: brands.map((b) => new RegExp(b, "i")) };
    }

    if (category) {
      const categories = Array.isArray(category)
        ? category
        : category.split(",");
      if (categories.length > 0) filter.category = { $in: categories };
    }

    if (condition) {
      const conditions = Array.isArray(condition)
        ? condition
        : condition.split(",");
      if (conditions.length > 0) filter.condition = { $in: conditions };
    }

    // Sort options
    let sortBy = "createdAt";
    let sortOrder = -1; // Descending by default

    if (sort === "price_asc") {
      sortBy = "price";
      sortOrder = 1;
    } else if (sort === "price_desc") {
      sortBy = "price";
      sortOrder = -1;
    } else if (sort === "year_desc") {
      sortBy = "year";
      sortOrder = -1;
    } else if (sort === "year_asc") {
      sortBy = "year";
      sortOrder = 1;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [listings, totalCount] = await Promise.all([
      Listing.find(filter)
        .sort({ [sortBy]: sortOrder })
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

// GET listing facets (min/max price, brands, categories) for UI initialization
export const getListingFacets = async (req, res) => {
  try {
    const stats = await Listing.aggregate([
      {
        $match: { status: "active" }, // Only aggregate active listings
      },
      {
        $facet: {
          priceRange: [
            {
              $group: {
                _id: null,
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
              },
            },
          ],
          brands: [{ $group: { _id: "$brand", count: { $sum: 1 } } }],
          categories: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
        },
      },
    ]);

    const result = stats[0];
    const priceRange = result.priceRange[0] || { minPrice: 0, maxPrice: 10000 };
    // Convert Decimal128 to float for frontend
    if (priceRange.minPrice && priceRange.minPrice.toString)
      priceRange.minPrice = parseFloat(priceRange.minPrice.toString());
    if (priceRange.maxPrice && priceRange.maxPrice.toString)
      priceRange.maxPrice = parseFloat(priceRange.maxPrice.toString());

    res.status(200).json({
      success: true,
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
      brands: result.brands.map((b) => ({ name: b._id, count: b.count })),
      categories: result.categories.map((c) => ({
        name: c._id,
        count: c.count,
      })),
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to get filter facets",
    });
  }
};
