/* eslint-disable no-unused-vars */
import logger from "../utils/logging.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  res.status(err.status || 500).json({
    success: false,
    msg: err.message || "Server Error",
  });
};
