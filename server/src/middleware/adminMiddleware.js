import { authenticate } from "./auth.js";

/**
 * Middleware to check if the authenticated user has an 'admin' role.
 * Relies on the 'authenticate' middleware running first.
 */
export const authorizeAdmin = [
  authenticate,
  (req, res, next) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({
        success: false,
        msg: "Access Denied: Admin privileges required",
      });
    }
  },
];
