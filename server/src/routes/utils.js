import express from "express";
import { geocodeLocation, reverseGeocode } from "../utils/geocoder.js";
import { logError } from "../util/logging.js";

const utilsRouter = express.Router();

/**
 * GET /api/utils/geocode?q=...
 * Converts a string address/location to GeoJSON coordinates.
 */
utilsRouter.get("/geocode", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res
        .status(400)
        .json({ success: false, msg: "Query parameter 'q' is required" });
    }

    const result = await geocodeLocation(q);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, msg: "Location not found" });
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Internal server error during geocoding" });
  }
});

/**
 * GET /api/utils/reverse-geocode?lat=...&lon=...
 * Converts lat/lng coordinates to a readable address string.
 */
utilsRouter.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        msg: "Parameters 'lat' and 'lon' are required",
      });
    }

    const address = await reverseGeocode(parseFloat(lat), parseFloat(lon));
    if (!address) {
      return res.status(404).json({ success: false, msg: "Address not found" });
    }

    res.status(200).json({ success: true, result: address });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Internal server error during reverse geocoding",
    });
  }
});

export default utilsRouter;
