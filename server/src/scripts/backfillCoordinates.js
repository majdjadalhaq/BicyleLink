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
  console.error(
    "MONGODB_URL environment variable is not set. Please check your .env configuration.",
  );
  process.exit(1);
}

const backfillCoordinates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    // Find listings missing coordinates (field missing, null, or missing nested value)
    const listings = await Listing.find({
      $or: [
        { coordinates: { $exists: false } },
        { coordinates: null },
        { "coordinates.coordinates": { $exists: false } },
      ],
    });

    console.log(`Found ${listings.length} listings missing coordinates.`);

    let successCount = 0;
    let failCount = 0;

    for (const listing of listings) {
      if (!listing.location) continue;

      console.log(
        `Geocoding location: ${listing.location} for listing ${listing._id}`,
      );

      const coords = await geocodeLocation(listing.location);

      if (coords) {
        listing.coordinates = coords;
        await listing.save();
        successCount++;
        console.log(`✅ Success for ${listing.location}`);
      } else {
        failCount++;
        console.log(`❌ Failed for ${listing.location}`);
      }

      // Nominatim requires max 1 request per second to avoid getting blocked
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    console.log(
      `\nBackfill complete. Success: ${successCount}, Failed: ${failCount}`,
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error during backfill:", error);
    process.exit(1);
  }
};

backfillCoordinates();
