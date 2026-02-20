import { validationResult } from "express-validator";

/**
 * Middleware to handle express-validator results.
 * Must be placed LAST in any validation rule array.
 *
 * On failure, returns HTTP 400 with a normalized error array:
 *   { success: false, errors: [{ field: "rating", message: "..." }] }
 *
 * On success, passes to the next middleware/controller.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const normalizedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      errors: normalizedErrors,
    });
  }

  next();
};

export default handleValidationErrors;
