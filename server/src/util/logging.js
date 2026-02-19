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
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        // Add colorize for better readability in logs if desired, but simple is safer
      ),
    }),
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
