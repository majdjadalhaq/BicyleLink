import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Listing from "../models/Listing.js";
import { logError } from "../utils/logging.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { emitNotification } from "../socket/socketHandler.js";
import {
  buildListingFilter,
  buildListingSort,
} from "../utils/listingHelpers.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ userId }).select("listingId");
    const ids = favorites.map((f) => f.listingId);

    if (ids.length === 0) {
      return res.status(200).json({ success: true, result: [] });
    }

    // Build the base filter from query params
    const filter = buildListingFilter(req.query);

    // Constrain to only the user's favorite IDs
    filter._id = { $in: ids };

    // Handle sorting
    const { sortObject } = buildListingSort(req.query.sort);

    const listings = await Listing.find(filter).sort(sortObject);

    // Cleanup logic: detect favorite entries for listings that no longer exist
    const foundIds = listings.map((listing) => String(listing._id));
    const missingIds = ids
      .map((id) => String(id))
      .filter((id) => !foundIds.includes(id));

    // Only cleanup if no other filters were active (to avoid deleting valid gems just because they didn't match the current search)
    const activeFilterCount = Object.keys(req.query).length;

    if (missingIds.length > 0 && activeFilterCount === 0) {
      try {
        await Favorite.deleteMany({ userId, listingId: { $in: missingIds } });
      } catch (cleanupError) {
        logError(cleanupError);
      }
    }

    res.status(200).json({ success: true, result: listings });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to get favorites" });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { listingId } = req.params;

    if (!isValidObjectId(listingId)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid listing ID" });
    }

    const listing = await Listing.findById(listingId).select("ownerId title");
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    const existing = await Favorite.findOne({ userId, listingId });
    // If already favorited -> remove favorite (NO notification)
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res
        .status(200)
        .json({ success: true, result: { favorited: false } });
    }

    // Add favorite
    await Favorite.create({ userId, listingId });

    // Create notification for listing owner (only when someone else favorites)
    const ownerId = listing.ownerId;

    if (ownerId && ownerId.toString() !== userId.toString()) {
      const recipient = await User.findById(ownerId).select(
        "name notificationSettings",
      );

      // Check notification settings
      if (recipient?.notificationSettings?.favorites !== false) {
        const sender = await User.findById(userId).select("name");

        const notification = await Notification.create({
          recipientId: ownerId,
          senderId: userId,
          listingId: listingId,
          type: "favorite",
          title: "Added to favorites",
          body: `${sender?.name || "Someone"} added your listing to favorites`,
          link: `/profile/${userId}`,
          read: false,
        });

        emitNotification(ownerId, notification);
      }
    }

    return res.status(201).json({ success: true, result: { favorited: true } });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(200)
        .json({ success: true, result: { favorited: true } });
    }
    logError(error);
    return res
      .status(500)
      .json({ success: false, msg: "Unable to toggle favorite" });
  }
};

export const getMyFavoriteIds = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ userId }).select("listingId");
    res
      .status(200)
      .json({ success: true, result: favorites.map((f) => f.listingId) });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to get favorite ids" });
  }
};
