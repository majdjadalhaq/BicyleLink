import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  message: {
    success: false,
    msg: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 login attempts per hour
  message: {
    success: false,
    msg: "Too many login attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const sensitiveOpsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 attempts per minute
  message: {
    success: false,
    msg: "Too many attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
