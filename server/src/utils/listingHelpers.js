/**
 * Pure helper functions for building MongoDB filter and sort objects for listings.
 * No DB access, no Express dependencies — input/output are plain objects.
 */

// Escape special regex characters to prevent ReDoS attacks
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Builds a MongoDB filter object from listing query parameters.
 *
 * @param {object} query - Raw query params from req.query
 * @returns {object} MongoDB filter object
 */
export const buildListingFilter = (query) => {
  const {
    status,
    location,
    lat,
    lng,
    radius,
    search,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    brand,
    category,
    condition,
    ownerId,
  } = query;

  const filter = status ? { status } : { status: { $in: ["active", "sold"] } };

  // Geospatial filter using lat/lng/radius
  if (lat !== undefined && lng !== undefined && radius !== undefined) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedRadius = parseFloat(radius);

    if (
      !isFinite(parsedLat) ||
      !isFinite(parsedLng) ||
      !isFinite(parsedRadius) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLng < -180 ||
      parsedLng > 180 ||
      parsedRadius <= 0
    ) {
      // Signal invalid geo params via a special marker for the controller to catch
      filter.__invalidGeo = true;
      return filter;
    }

    const radiusInRadians = parsedRadius / 6371;
    const geoFilter = {
      coordinates: {
        $geoWithin: {
          $centerSphere: [[parsedLng, parsedLat], radiusInRadians],
        },
      },
    };

    const locationFilters = [geoFilter];
    if (location) {
      locationFilters.push({
        location: { $regex: escapeRegex(location), $options: "i" },
        coordinates: { $exists: false },
      });
    }

    if (!filter.$and) filter.$and = [];
    filter.$and.push({ $or: locationFilters });
  } else if (location) {
    filter.location = { $regex: escapeRegex(location), $options: "i" };
  }

  // Owner filter — shows all statuses when filtering by owner
  if (ownerId) {
    filter.ownerId = ownerId;
    if (!status) {
      delete filter.status;
    }
  }

  // Full-text style search across title, brand, model, location, description
  if (search) {
    const searchRegex = { $regex: escapeRegex(search), $options: "i" };
    if (!filter.$and) filter.$and = [];
    filter.$and.push({
      $or: [
        { title: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ],
    });
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Year range
  if (minYear || maxYear) {
    filter.year = {};
    if (minYear) filter.year.$gte = parseInt(minYear, 10);
    if (maxYear) filter.year.$lte = parseInt(maxYear, 10);
  }

  // Multi-select brand filter
  if (brand) {
    const brands = Array.isArray(brand) ? brand : brand.split(",");
    if (brands.length > 0) {
      filter.brand = {
        $in: brands.map((b) => new RegExp(escapeRegex(b), "i")),
      };
    }
  }

  // Multi-select category filter
  if (category) {
    const categories = Array.isArray(category) ? category : category.split(",");
    if (categories.length > 0) filter.category = { $in: categories };
  }

  // Multi-select condition filter
  if (condition) {
    const conditions = Array.isArray(condition)
      ? condition
      : condition.split(",");
    if (conditions.length > 0) filter.condition = { $in: conditions };
  }

  return filter;
};

/**
 * Builds sort parameters from a sort string.
 *
 * @param {string} sort - Sort option string (e.g. "price_asc", "year_desc")
 * @returns {{ sortBy: string, sortOrder: 1 | -1 }}
 */
export const buildListingSort = (sort) => {
  const sortMap = {
    price_asc: { sortBy: "price", sortOrder: 1, sortObject: { price: 1 } },
    price_desc: { sortBy: "price", sortOrder: -1, sortObject: { price: -1 } },
    year_desc: { sortBy: "year", sortOrder: -1, sortObject: { year: -1 } },
    year_asc: { sortBy: "year", sortOrder: 1, sortObject: { year: 1 } },
  };

  return (
    sortMap[sort] || {
      sortBy: "createdAt",
      sortOrder: -1,
      sortObject: { isFeatured: -1, createdAt: -1 },
    }
  );
};
