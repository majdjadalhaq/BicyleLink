/**
 * Check if a value is a plain object (created by `{}` or `new Object()`).
 * Returns false for null, arrays, Date, Map, Set, and other built-in types.
 * Used for validating request body shapes before processing.
 *
 * @param {*} val - The value to check.
 * @returns {boolean}
 */
export const isPlainObject = (val) => {
  if (val == null || typeof val !== "object" || Array.isArray(val))
    return false;
  const proto = Object.getPrototypeOf(val);
  return proto === Object.prototype || proto === null;
};
