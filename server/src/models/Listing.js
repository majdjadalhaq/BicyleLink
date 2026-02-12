import mongoose from "mongoose";

import validateAllowedFields from "../util/validateAllowedFields.js";

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  price: { type: mongoose.Schema.Types.Decimal128, required: true },
  status: {
    type: String,
    enum: ["active", "sold", "cancelled"],
    default: "active",
  },
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

const REQUIRED_FIELDS = ["title", "description", "price", "location"];
const ALLOWED_KEYS = [
  ...REQUIRED_FIELDS,
  "ownerId",
  "images",
  "status",
  "brand",
  "model",
  "year",
  "condition",
  "mileage",
];

export const validateListing = (listingObject) => {
  const errorList = [];

  // Defensive check: reject null, undefined, arrays, and non-objects
  if (
    listingObject == null ||
    typeof listingObject !== "object" ||
    Array.isArray(listingObject)
  ) {
    errorList.push("listing must be a valid object");
    return errorList;
  }

  const validatedKeysMessage = validateAllowedFields(
    listingObject,
    ALLOWED_KEYS,
  );
  if (validatedKeysMessage.length > 0) {
    errorList.push(validatedKeysMessage);
  }

  // Validate required fields
  REQUIRED_FIELDS.forEach((field) => {
    if (listingObject[field] == null) {
      errorList.push(`${field} is a required field`);
    }
  });

  // Validate price is a finite non-negative number
  if (
    listingObject.price != null &&
    (!Number.isFinite(listingObject.price) || listingObject.price < 0)
  ) {
    errorList.push("price must be a non-negative number");
  }

  return errorList;
};

export default Listing;
