import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // Print stack trace for errors
    process.env.NODE_ENV !== "production"
      ? colorize()
      : winston.format.uncolorize(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transport for production error logs
    ...(process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          new winston.transports.File({ filename: "logs/combined.log" }),
        ]
      : []),
  ],
});

export const logError = (error, context = "") => {
  const msg = context ? `${context}: ${error.message}` : error.message;
  logger.error(msg, { stack: error.stack });
};

export const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

export const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

export default logger;
