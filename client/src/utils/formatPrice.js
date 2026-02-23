/**
 * Formats a price value into a localized currency string.
 * Supports raw numbers, strings, and MongoDB Decimal128 objects.
 * @param {number|string|object} price - The price value to format.
 * @returns {string} The formatted price (e.g., "1.250").
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return "0";

  let value = price;

  // Handle MongoDB Decimal128 if passed as an object
  if (typeof price === "object" && price.$numberDecimal) {
    value = price.$numberDecimal;
  } else if (typeof price === "object" && price.value !== undefined) {
    value = price.value;
  }

  const num = parseFloat(value);
  if (isNaN(num)) return "0";

  // Use Dutch grouping format (dot for thousands)
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};
