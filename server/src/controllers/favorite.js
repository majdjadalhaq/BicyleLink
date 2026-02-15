import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Listing from "../models/Listing.js";
import { logError } from "../util/logging.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ userId }).select("listingId");
    const ids = favorites.map((f) => f.listingId);

    if (ids.length === 0) {
      return res.status(200).json({ success: true, result: [] });
    }

    const listings = await Listing.find({ _id: { $in: ids } });

    const foundIds = listings.map((listing) => String(listing._id));
    const missingIds = ids
      .map((id) => String(id))
      .filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
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

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    const existing = await Favorite.findOne({ userId, listingId });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res
        .status(200)
        .json({ success: true, result: { favorited: false } });
    }

    await Favorite.create({ userId, listingId });
    return res.status(201).json({ success: true, result: { favorited: true } });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(200)
        .json({ success: true, result: { favorited: true } });
    }
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to toggle favorite" });
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
