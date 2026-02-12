import jwt from "jsonwebtoken";
import { logError } from "../util/logging.js";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing from environment variables");
  }
  return secret;
};

/**
 * Sign a JWT token for a user
 * @param {Object} user - User object
 * @returns {string} Signed JWT token
 */
export const signToken = (user) => {
  return jwt.sign({ id: user._id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    logError(error);
    return null;
  }
};

/**
 * Configuration for the auth cookie
 */
export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};
