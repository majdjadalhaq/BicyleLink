import mongoose from "mongoose";

import validateAllowedFields from "../util/validateAllowedFields.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  bio: { type: String },
  isVerified: { type: Boolean, default: false },
  agreedToTerms: {
    type: Boolean,
    required: true,
    validate: {
      validator: (v) => v === true,
      message: "Terms of Service must be accepted",
    },
  },
  avatarUrl: { type: String, trim: true },
  verificationCode: { type: String, index: true },
  verificationCodeExpiry: { type: Date },
  passwordResetCode: { type: String },
  passwordResetCodeExpiry: { type: Date, index: true },
  passwordResetCodeUsed: { type: Boolean, default: false },
});

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
  }

  if (userObject.password == null) {
    errorList.push("password is a required field");
  }

  if (userObject.city == null) {
    errorList.push("city is a required field");
  }

  if (userObject.country == null) {
    errorList.push("country is a required field");
  }

  if (userObject.agreedToTerms !== true) {
    errorList.push("Terms of Service must be accepted");
  }

  return errorList;
};

export default User;
