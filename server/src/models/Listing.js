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
  location: {
    type: String,
    required: [true, "location is required"],
  },
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

// Automatically convert Decimal128 to standard string during JSON conversion
listingSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.price) {
      ret.price = ret.price.toString();
    }
    return ret;
  },
});

const Listing = mongoose.model("listings", listingSchema);

export default Listing;
