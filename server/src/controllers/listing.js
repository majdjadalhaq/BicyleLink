import mongoose from "mongoose";

import Listing from "../models/Listing.js";
import { logError } from "../util/logging.js";
import validationErrorMessage from "../util/validationErrorMessage.js";

// Helper to escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper to geocode a city name to [lng, lat] using Nominatim (free, no API key)
const geocodeLocation = async (locationString) => {
  try {
    const encoded = encodeURIComponent(locationString);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      headers: { "User-Agent": "BiCycleL/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      logError(`Geocoding failed with status ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
      };
    }
    return null;
  } catch (error) {
    logError(error);
    return null;
  }
};

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
  "category",
  "coordinates",
];

// GET all listings
export const getListings = async (req, res) => {
  try {
    const {
      status,
      location,
      lat,
      lng,
      radius,
      search,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      brand,
      category,
      condition,
      sort,
      ownerId,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = status
      ? { status }
      : { status: { $in: ["active", "sold"] } };

    // Geospatial filter: validate lat, lng, and radius before using $geoWithin
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      const parsedRadius = parseFloat(radius);

      if (
        !isFinite(parsedLat) ||
        !isFinite(parsedLng) ||
        !isFinite(parsedRadius) ||
        parsedLat < -90 ||
        parsedLat > 90 ||
        parsedLng < -180 ||
        parsedLng > 180 ||
        parsedRadius <= 0
      ) {
        return res.status(400).json({
          success: false,
          msg: "Invalid geospatial params: lat must be [-90,90], lng must be [-180,180], radius must be > 0",
        });
      }

      const radiusInRadians = parsedRadius / 6371; // Earth radius in km
      filter.coordinates = {
        $geoWithin: {
          $centerSphere: [[parsedLng, parsedLat], radiusInRadians],
        },
      };
    } else if (location) {
      // Fallback to string-based location filter
      filter.location = { $regex: escapeRegex(location), $options: "i" };
    }

    if (ownerId) {
      filter.ownerId = ownerId;
      // If filtering by owner, we might want to see all their listings, not just active ones?
      // For now, let's keep the status filter logic (defaults to active/sold) unless overridden.
      // But if standard user wants to see their 'cancelled' ones too, we might need to adjust.
      // Let's assume for "My Listings" we want to see everything they own.
      // So if ownerId is present, we might want to relax the default status filter if status wasn't explicitly provided.
      if (!status) {
        delete filter.status; // Remove default active/sold filter to show all
      }
    }

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
      const brands = Array.isArray(brand) ? brand : brand.split(",");
      if (brands.length > 0) {
        // Sanitize regex input to prevent ReDoS
        filter.brand = {
          $in: brands.map((b) => new RegExp(escapeRegex(b), "i")),
        };
      }
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

    // Validate pagination
    if (
      !Number.isInteger(pageNum) ||
      !Number.isInteger(limitNum) ||
      pageNum < 1 ||
      limitNum < 1 ||
      limitNum > 100
    ) {
      return res.status(400).json({
        success: false,
        msg: "Invalid pagination parameters: page must be >= 1 and limit must be between 1 and 100.",
      });
    }

    const skip = (pageNum - 1) * limitNum;

    // Handle nulls in sorting
    if (sortBy === "price" || sortBy === "year") {
      filter[sortBy] = { ...filter[sortBy], $ne: null };
    }

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

    // Geocode location to coordinates if location is provided and no coordinates given
    if (safeListing.location && !safeListing.coordinates) {
      const geoResult = await geocodeLocation(safeListing.location);
      if (geoResult) {
        safeListing.coordinates = geoResult;
      }
    }

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

    // Geocode location to coordinates if location changed
    if (updates.location && !updates.coordinates) {
      const geoResult = await geocodeLocation(updates.location);
      if (geoResult) {
        req.resource.coordinates = geoResult;
      }
    }

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
    // Handle empty results gracefully
    const hasPriceRange =
      stats[0] &&
      stats[0].priceRange &&
      Array.isArray(stats[0].priceRange) &&
      stats[0].priceRange.length > 0;

    const priceRange = hasPriceRange
      ? stats[0].priceRange[0]
      : { minPrice: 0, maxPrice: 0 };

    if (priceRange.minPrice && priceRange.minPrice.toString)
      priceRange.minPrice = parseFloat(priceRange.minPrice.toString());
    if (priceRange.maxPrice && priceRange.maxPrice.toString)
      priceRange.maxPrice = parseFloat(priceRange.maxPrice.toString());

    res.status(200).json({
      success: true,
      minPrice: priceRange.minPrice || 0,
      maxPrice: priceRange.maxPrice || 0,
      brands: result.brands
        .filter((b) => b._id != null)
        .map((b) => ({ name: b._id, count: b.count })),
      categories: result.categories
        .filter((c) => c._id != null)
        .map((c) => ({
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
