import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV !== "production";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10_000 : 1000, // relaxed in dev, increased for prod SPAs
  message: {
    success: false,
    msg: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 500 : 10, // relaxed in dev, strict in prod
  message: {
    success: false,
    msg: "Too many login attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const sensitiveOpsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 500 : 20, // relaxed in dev, strict in prod
  message: {
    success: false,
    msg: "Too many attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
