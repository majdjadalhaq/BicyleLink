/**
 * Allowed fields for listing creation and update.
 * Shared between listing.js and admin.js controllers to avoid duplication.
 * Prevents prototype pollution by whitelisting only known fields.
 * Frozen to guard against accidental mutation.
 */
export const ALLOWED_LISTING_WRITE_FIELDS = Object.freeze([
  "title",
  "description",
  "price",
  "images",
  "location",
  "brand",
  "model",
  "year",
  "condition",
  "mileage",
  "status",
  "category",
  "coordinates",
]);
