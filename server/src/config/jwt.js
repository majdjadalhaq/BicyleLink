import jwt from "jsonwebtoken";

const getJwtSecret = () => {
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
 * Configuration for the auth cookie
 */
export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};
