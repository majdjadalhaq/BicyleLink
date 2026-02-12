import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logError } from "../util/logging.js";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing from environment variables");
  }
  return secret;
};

export const authenticate = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in cookies
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // 2. Check for token in Authorization header (Bearer token)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, getJwtSecret());

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          msg: "The user belonging to this token no longer does exist",
        });
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        msg: "Not authorized to access this route",
      });
    }
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};
