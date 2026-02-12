import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    msg: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login requests per hour
  message: {
    success: false,
    msg: "Too many login attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const sensitiveOpsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Strict limit for sensitive operations
  message: {
    success: false,
    msg: "Too many attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
