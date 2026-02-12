import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logError } from "../util/logging.js";

import { getJwtSecret } from "../config/jwt.js";

export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (
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

      req.user = user;
      next();
    } catch (error) {
      // Only treat known JWT verification errors as unauthorized.
      if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError"
      ) {
        return res.status(401).json({
          success: false,
          msg: "Not authorized to access this route",
        });
      }
      // Let unexpected errors bubble up to the outer handler
      throw error;
    }
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};
