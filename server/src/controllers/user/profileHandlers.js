import mongoose from "mongoose";
import User from "../../models/User.js";
import Listing from "../../models/Listing.js";
import Review from "../../models/Review.js";
import { logError } from "../../utils/logging.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, country, city, bio, avatarUrl } = req.body;

    if (name && name !== req.user.name) {
      const existingUser = await User.findOne({ name });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, msg: "Username is already taken" });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, country, city, bio, avatarUrl },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to update profile" });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    let user = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id).select(
        "-password -verificationCode -verificationCodeExpiry -securityCode -securityCodeExpiry -pendingEmail",
      );
    }

    if (!user) {
      user = await User.findOne({ name: id }).select(
        "-password -verificationCode -verificationCodeExpiry -securityCode -securityCodeExpiry -pendingEmail",
      );
    }

    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    const userId = user._id;

    const listings = await Listing.find({ ownerId: userId }).sort("-createdAt");

    const reviewsReceived = await Review.find({ targetId: userId })
      .populate("reviewerId", "name avatarUrl")
      .sort("-createdAt");

    const reviewsGiven = await Review.find({ reviewerId: userId })
      .populate("targetId", "name avatarUrl")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      user,
      listings,
      reviewsReceived,
      reviewsGiven,
    });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to fetch profile details" });
  }
};
