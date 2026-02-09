import mongoose from "mongoose";

import validateAllowedFields from "../util/validateAllowedFields.js";

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ["used", "lease"],
    required: true,
  },
  images: [{ type: String }],
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["active", "sold", "cancelled"],
    default: "active",
  },
  leaseDuration: { type: Number }, // in months, only for lease type
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  location: { type: String, required: true },
  brand: { type: String },
  model: { type: String },
  year: { type: Number },
  condition: {
    type: String,
    enum: ["new", "like-new", "good", "fair", "poor"],
  },
  mileage: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const Listing = mongoose.model("listings", listingSchema);

export const validateListing = (listingObject) => {
  const errorList = [];
  const allowedKeys = [
    "title",
    "description",
    "type",
    "images",
    "price",
    "status",
    "leaseDuration",
    "ownerId",
    "location",
    "brand",
    "model",
    "year",
    "condition",
    "mileage",
  ];

  const validatedKeysMessage = validateAllowedFields(
    listingObject,
    allowedKeys,
  );

  if (validatedKeysMessage.length > 0) {
    errorList.push(validatedKeysMessage);
  }

  if (listingObject.title == null) {
    errorList.push("title is a required field");
  }

  if (listingObject.description == null) {
    errorList.push("description is a required field");
  }

  if (listingObject.type == null) {
    errorList.push("type is a required field");
  } else if (!["used", "lease"].includes(listingObject.type)) {
    errorList.push("type must be either 'used' or 'lease'");
  }

  if (listingObject.price == null) {
    errorList.push("price is a required field");
  } else if (
    typeof listingObject.price !== "number" ||
    listingObject.price < 0
  ) {
    errorList.push("price must be a positive number");
  }

  if (listingObject.ownerId == null) {
    errorList.push("ownerId is a required field");
  }

  if (listingObject.location == null) {
    errorList.push("location is a required field");
  }

  // Lease-specific validation
  if (listingObject.type === "lease" && listingObject.leaseDuration == null) {
    errorList.push("leaseDuration is required for lease listings");
  }

  return errorList;
};

export default Listing;
