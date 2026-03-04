/* eslint-disable no-console */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Listing from "../models/Listing.js";
import { geocodeLocation } from "../utils/geocoder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URL environment variable is not set.");
  process.exit(1);
}

const forceUpdateBerlin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    // Target listings where location is Berlin (case-insensitive)
    const listings = await Listing.find({
      location: { $regex: /^berlin$/i },
    });

    console.log(`Found ${listings.length} Berlin listings to update.`);

    for (const listing of listings) {
      console.log(
        `Updating coords for ${listing.location} (ID: ${listing._id})...`,
      );
      // Explicitly add ", Germany" to avoid ambiguity (was picking Saint Martin!)
      const query =
        listing.location.toLowerCase() === "berlin"
          ? "Berlin, Germany"
          : listing.location;
      const coords = await geocodeLocation(query);

      if (coords) {
        listing.coordinates = coords;
        await listing.save();
        console.log(
          `✅ Fixed coordinates for ${listing._id} to Berlin, Germany`,
        );
      } else {
        console.log(`❌ Failed to geocode ${listing.location}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    await mongoose.disconnect();
    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

forceUpdateBerlin();
