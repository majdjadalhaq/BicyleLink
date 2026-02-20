import { logError } from "../util/logging.js";

/**
 * Geocodes a location string to a GeoJSON Point using the Nominatim API.
 * Returns null silently if geocoding fails — callers should handle the null case.
 *
 * @param {string} locationString - A city name or address (e.g. "Amsterdam").
 * @returns {Promise<{type: "Point", coordinates: [number, number]} | null>}
 */
export const geocodeLocation = async (locationString) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const encoded = encodeURIComponent(locationString);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: { "User-Agent": "BiCycleL/1.0 (hyf-project)" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logError(`Geocoding failed with status ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
      };
    }

    return null;
  } catch (error) {
    clearTimeout(timeoutId);
    // AbortError is expected on timeout — log only unexpected errors
    if (error.name !== "AbortError") {
      logError(error);
    }
    return null;
  }
};
