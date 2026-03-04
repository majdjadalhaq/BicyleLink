import mongoose from "mongoose";

import Listing from "../models/Listing.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import { logError } from "../utils/logging.js";
import { emitNotification } from "../socket/socketHandler.js";
import validationErrorMessage from "../utils/validationErrorMessage.js";
import { geocodeLocation } from "../utils/geocoder.js";
import {
  buildListingFilter,
  buildListingSort,
} from "../utils/listingHelpers.js";
import { ALLOWED_LISTING_WRITE_FIELDS } from "../utils/listingConstants.js";

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to check if value is a non-null, non-array object
const isPlainObject = (val) =>
  val != null && typeof val === "object" && !Array.isArray(val);

// GET /api/listings — paginated list with filtering, searching, and sorting
export const getListings = async (req, res) => {
  try {
    const filter = buildListingFilter(req.query);

    if (filter.__invalidGeo) {
      return res.status(400).json({
        success: false,
        msg: "Invalid geospatial params: lat must be [-90,90], lng must be [-180,180], radius must be > 0",
      });
    }
    if (filter.__invalidPriceRange) {
      return res.status(400).json({
        success: false,
        msg: "Invalid price range: minPrice must be less than or equal to maxPrice",
      });
    }
    if (filter.__invalidYearRange) {
      return res.status(400).json({
        success: false,
        msg: "Invalid year range: minYear must be less than or equal to maxYear",
      });
    }

    const { sort, page = 1, limit = 10 } = req.query;
    const { sortBy, sortObject } = buildListingSort(sort);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

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

    // Exclude null values from price/year fields when sorting by them
    if (sortBy === "price" || sortBy === "year") {
      filter[sortBy] = { ...filter[sortBy], $ne: null };
    }

    const [listings, totalCount] = await Promise.all([
      Listing.find(filter)
        .sort(sortObject)
        .skip(skip)
        .limit(limitNum)
        .populate("ownerId", "name email avatarUrl ratingSum reviewCount"),
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

// GET /api/listings/:id — single listing by ID
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
      "name email avatarUrl ratingSum reviewCount",
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

// POST /api/listings — create a new listing
export const createListing = async (req, res) => {
  try {
    const listingData = req.body?.listing;

    if (!isPlainObject(listingData)) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide a 'listing' object.",
      });
    }

    // Whitelist allowed fields to prevent prototype pollution
    const safeListing = {};
    ALLOWED_LISTING_WRITE_FIELDS.forEach((field) => {
      if (listingData[field] !== undefined) {
        safeListing[field] = listingData[field];
      }
    });

    safeListing.ownerId = req.user._id;

    // Geocode location if no coordinates are explicitly provided
    if (safeListing.location && !safeListing.coordinates) {
      const geoResult = await geocodeLocation(safeListing.location);
      if (geoResult) {
        safeListing.coordinates = geoResult;
      }
    }

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

// PUT /api/listings/:id — update a listing (ownership checked by middleware)
export const updateListing = async (req, res) => {
  try {
    const updates = req.body?.listing;

    if (!isPlainObject(updates)) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide a 'listing' object with updates.",
      });
    }

    ALLOWED_LISTING_WRITE_FIELDS.forEach((field) => {
      if (updates[field] !== undefined) {
        req.resource[field] = updates[field];
      }
    });

    // Re-geocode if location changed without explicit coordinates
    if (updates.location && !updates.coordinates) {
      const geoResult = await geocodeLocation(updates.location);
      if (geoResult) {
        req.resource.coordinates = geoResult;
      }
    }

    await req.resource.save();
    res.status(200).json({ success: true, listing: req.resource });
  } catch (error) {
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

// DELETE /api/listings/:id — delete a listing (ownership checked by middleware)
export const deleteListing = async (req, res) => {
  try {
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

// PATCH /api/listings/:id/status — update listing status (e.g. mark as sold)
export const updateStatus = async (req, res) => {
  try {
    const { status, buyerId } = req.body;

    if (!["active", "sold", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, msg: "Invalid status" });
    }

    req.resource.status = status;

    if (status === "sold" && buyerId) {
      if (!isValidObjectId(buyerId)) {
        return res
          .status(400)
          .json({ success: false, msg: "Invalid buyer ID" });
      }

      // BUYER LOCK: If listing already has a buyerId, it cannot be changed to a different one
      if (
        req.resource.buyerId &&
        req.resource.buyerId.toString() !== buyerId.toString()
      ) {
        return res.status(400).json({
          success: false,
          msg: "Listing is already locked to a different buyer from a previous transaction.",
        });
      }

      req.resource.buyerId = buyerId;
    } else if (status !== "sold") {
      // Note: We keep req.resource.buyerId if it's already set to preserve the "Lock"
      // but if the status becomes active again, we technically don't use it.
      // However, the user request says "if he reactivate it he cant choose another user when mark as sold again"
      // So we must NOT nullify it if we want to enforce the lock later.
      // req.resource.buyerId = null; // REMOVED to maintain lock
    }

    await req.resource.save();

    // Create a notification for the buyer about review permission
    if (status === "sold" && buyerId) {
      try {
        const recipient = await User.findById(buyerId).select(
          "notificationSettings",
        );

        if (recipient?.notificationSettings?.reviews !== false) {
          const notification = await Notification.create({
            recipientId: buyerId,
            senderId: req.resource.ownerId,
            type: "review_permission",
            listingId: req.resource._id,
            title: "Review Seller Access",
            body: `You can now review your purchase: ${req.resource.title}`,
            link: `/listings/${req.resource._id}`,
          });
          emitNotification(buyerId, notification);
        }
      } catch (notifErr) {
        logError(notifErr);
      }
    }

    // Live broadcast to anyone viewing the listing
    const io = req.app.get("io");
    if (io) {
      io.to(req.resource._id.toString()).emit("listing_status_updated", {
        status: req.resource.status,
        buyerId: req.resource.buyerId,
      });
    }

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

// GET /api/listings/facets — price range, brands, and categories for filter UI
export const getListingFacets = async (req, res) => {
  try {
    const stats = await Listing.aggregate([
      { $match: { status: "active" } },
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
    const hasPriceRange =
      result?.priceRange &&
      Array.isArray(result.priceRange) &&
      result.priceRange.length > 0;

    const priceRange = hasPriceRange
      ? result.priceRange[0]
      : { minPrice: 0, maxPrice: 0 };

    if (priceRange.minPrice?.toString) {
      priceRange.minPrice = parseFloat(priceRange.minPrice.toString());
    }
    if (priceRange.maxPrice?.toString) {
      priceRange.maxPrice = parseFloat(priceRange.maxPrice.toString());
    }

    res.status(200).json({
      success: true,
      minPrice: priceRange.minPrice || 0,
      maxPrice: priceRange.maxPrice || 0,
      brands: result.brands
        .filter((b) => b._id != null)
        .map((b) => ({ name: b._id, count: b.count })),
      categories: result.categories
        .filter((c) => c._id != null)
        .map((c) => ({ name: c._id, count: c.count })),
    });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to get filter facets" });
  }
};

// GET /api/listings/:id/candidates — users who chatted about a listing (owner only)
export const getCandidates = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid listing ID" });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    if (listing.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to view candidates for this listing",
      });
    }

    const distinctUserIds = await Message.distinct("senderId", {
      listingId: id,
      senderId: { $ne: req.user._id },
    });

    const distinctReceiverIds = await Message.distinct("receiverId", {
      listingId: id,
      receiverId: { $ne: req.user._id },
    });

    const allCandidateIds = [
      ...new Set([
        ...distinctUserIds.map((id) => id.toString()),
        ...distinctReceiverIds.map((id) => id.toString()),
      ]),
    ];

    if (allCandidateIds.length === 0) {
      return res.status(200).json({ success: true, result: [] });
    }

    const candidates = await mongoose
      .model("users")
      .find({ _id: { $in: allCandidateIds } })
      .select("name email avatarUrl");

    res.status(200).json({ success: true, result: candidates });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to get candidates" });
  }
};

// PATCH /api/listings/:id/view — increment view count
export const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid listing ID" });
    }

    // Optional: Only increment if the viewer is NOT the owner
    // We check this here if req.user is available via optionalAuth
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    if (req.user && listing.ownerId.toString() === req.user.id) {
      // Don't increment for owner, but return success 200 to silence client
      return res.status(200).json({ success: true, msg: "Owner view ignored" });
    }

    await Listing.findByIdAndUpdate(id, { $inc: { views: 1 } });
    res.status(200).json({ success: true, msg: "View count incremented" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};
