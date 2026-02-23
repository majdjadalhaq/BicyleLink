import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { logError } from "../util/logging.js";
import { getJwtSecret } from "../config/jwt.js";

// Helper to extract token
const getToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

export const authenticate = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Not authorized to access this route",
      });
    }

    try {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id).select(
        "-password -verificationCode -verificationCodeExpiry",
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          msg: "The user belonging to this token no longer exists",
        });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          msg: "Your account has been blocked by an administrator.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError"
      ) {
        return res.status(401).json({
          success: false,
          msg: "Not authorized to access this route",
        });
      }
      throw error;
    }
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id).select(
        "-password -verificationCode -verificationCodeExpiry",
      );
      req.user = user || null;
    } catch (error) {
      if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError"
      ) {
        req.user = null;
      } else {
        throw error;
      }
    }
    next();
  } catch (error) {
    logError(error);
    // Don't fail the request, just log and continue as guest
    req.user = null;
    next();
  }
};

export const requireVerified = (req, res, next) => {
  if (!req.user) {
    // Should be covered by authenticate, but safe guard
    return res.status(401).json({ success: false, msg: "Not authorized" });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      msg: "Email verification required",
    });
  }
  next();
};

export const requireOwnership = (Model, param = "id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[param];

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return res.status(400).json({ success: false, msg: "Invalid ID" });
      }

      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res
          .status(404)
          .json({ success: false, msg: "Resource not found" });
      }

      // Check ownership
      if (resource.ownerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          msg: "Not authorized to access this resource",
        });
      }

      // Attach resource for controller use to avoid refetching
      req.resource = resource;
      next();
    } catch (error) {
      logError(error);
      res.status(500).json({ success: false, msg: "Server Error" });
    }
  };
};
