import mongoose from "mongoose";

import validateAllowedFields from "../utils/validateAllowedFields.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    pendingEmail: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    city: { type: String },
    country: { type: String },
    bio: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    agreedToTerms: {
      type: Boolean,
      default: true,
    },
    avatarUrl: { type: String, trim: true },
    verificationCode: { type: String, index: true },
    verificationCodeExpiry: { type: Date },
    verificationCodeLastSentAt: { type: Date, default: null },
    verificationResendCount: { type: Number, default: 0 },
    verificationResendWindowStart: { type: Date, default: null },
    passwordResetCode: { type: String },
    passwordResetCodeExpiry: { type: Date, index: true },
    passwordResetCodeUsed: { type: Boolean, default: false },
    // Security Hardening Fields
    failedAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
    failedPasswordResetAttempts: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    securityCode: { type: String },
    securityCodeExpiry: { type: Date },
    // Rating System Fields
    ratingSum: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    // OAuth Fields
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: { type: String, unique: true, sparse: true },
    notificationSettings: {
      messages: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      favorites: { type: Boolean, default: true },
      marketing: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

// Virtual field for average rating
userSchema.virtual("averageRating").get(function () {
  if (this.reviewCount === 0) return 0;
  return (this.ratingSum / this.reviewCount).toFixed(1);
});

// Ensure virtuals are included in JSON output
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("users", userSchema);

export const validateUser = (userObject) => {
  const errorList = [];
  const allowedKeys = [
    "name",
    "email",
    "password",
    "city",
    "country",
    "bio",
    "agreedToTerms",
    "avatarUrl",
    "pendingEmail",
  ];

  const validatedKeysMessage = validateAllowedFields(userObject, allowedKeys);

  if (validatedKeysMessage.length > 0) {
    errorList.push(validatedKeysMessage);
  }

  if (userObject.name == null) {
    errorList.push("name is a required field");
  }

  if (userObject.email == null) {
    errorList.push("email is a required field");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userObject.email)) {
    errorList.push("email must be a valid email address");
  }

  if (userObject.password == null) {
    errorList.push("password is a required field");
  }

  /* Removed required checks for city/country to allow streamlined signup */
  /*
  if (userObject.city == null) {
    errorList.push("city is a required field");
  }

  if (userObject.country == null) {
    errorList.push("country is a required field");
  }
  */

  return errorList;
};

export default User;
