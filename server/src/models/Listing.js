import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "description is required"],
  },
  images: {
    type: [String],
    validate: {
      validator: function (v) {
        return v.length <= 5;
      },
      message: "You can only upload a maximum of 5 images.",
    },
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, "price is required"],
    validate: {
      validator: function (v) {
        return v != null && parseFloat(v.toString()) >= 0;
      },
      message: "price must be a non-negative number",
    },
  },
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
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    default: null,
  },
  location: {
    type: String,
    required: [true, "location is required"],
  },
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      required: function () {
        return this.coordinates != null && this.coordinates.coordinates != null;
      },
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function (val) {
          if (!val || val.length === 0) return true; // optional
          return (
            val.length === 2 &&
            val[0] >= -180 &&
            val[0] <= 180 &&
            val[1] >= -90 &&
            val[1] <= 90
          );
        },
        message: "Coordinates must be [longitude, latitude] with valid ranges",
      },
    },
  },
  brand: { type: String },
  model: { type: String },
  year: { type: Number },
  category: {
    type: String,
    enum: [
      "Road",
      "Mountain",
      "City",
      "E-bike",
      "Gravel",
      "Hybrid",
      "Kids",
      "Fixed Gear",
      "Cruiser",
      "Other",
    ],
    index: true,
    required: [true, "category is required"],
  },
  condition: {
    type: String,
    enum: ["new", "like-new", "good", "fair", "poor"],
    required: [true, "condition is required"],
  },
  mileage: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

// Automatically convert Decimal128 to standard string during JSON conversion
listingSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.price) {
      ret.price = ret.price.toString();
    }
    return ret;
  },
});

// Create 2dsphere index for geospatial queries
listingSchema.index({ coordinates: "2dsphere" });

const Listing = mongoose.model("listings", listingSchema);

export default Listing;
