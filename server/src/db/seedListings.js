import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "./connectDB.js";
import Listing from "../models/Listing.js";

const seedListings = [
  {
    title: "VanMoof S3 - Electric City Bike",
    description:
      "Selling my beloved VanMoof S3 due to moving abroad. It's in perfect condition, comes with the original charger and toolkit. The anti-theft tech works flawlessly.",
    price: 1450, // Changed to number
    condition: "like-new", // Enum: new, like-new, good, fair, poor
    brand: "VanMoof",
    images: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    location: "Amsterdam",
    ownerId: new mongoose.Types.ObjectId(), // Placeholder ID
  },
  {
    title: "Vintage Peugeot Road Bike",
    description:
      "Classic 1980s Peugeot road bike. Blue steel frame, new tires, and handlebar tape. A true beauty for vintage lovers. Rides smooth.",
    price: 250,
    condition: "good",
    brand: "Peugeot",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    location: "Utrecht",
    ownerId: new mongoose.Types.ObjectId(),
  },
  {
    title: "Gazelle Omafiets - Black",
    description:
      "Reliable Dutch granny bike. Has some rust spots but works perfectly. Comes with a sturdy lock and front carrier.",
    price: 120,
    condition: "fair",
    brand: "Gazelle",
    images: [
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    location: "Rotterdam",
    ownerId: new mongoose.Types.ObjectId(),
  },
  {
    title: "Cannondale Topstone Gravel Bike",
    description:
      "Ready for adventure! Carbon fork, Shimano GRX groupset. Only ridden 500km. Great for both road and forest trails.",
    price: 1800,
    condition: "like-new",
    brand: "Cannondale",
    images: [
      "https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    location: "Haarlem",
    ownerId: new mongoose.Types.ObjectId(),
  },
  {
    title: "Batavus Mambo Mother Bike",
    description:
      "Perfect family bike with extra space for child seats. 7 gears, wide tires for stability. Recently serviced.",
    price: 450,
    condition: "good",
    brand: "Batavus",
    images: [
      "https://images.unsplash.com/photo-1528191710846-99b8717a2833?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    location: "Den Haag",
    ownerId: new mongoose.Types.ObjectId(),
  },
  {
    title: "Fixie / Single Speed Converter",
    description:
      "Custom built fixie. Lightweight frame, flip-flop hub. Fast and fun for city commuting.",
    price: 300,
    condition: "good",
    brand: "Custom",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    ],
    location: "Eindhoven",
    ownerId: new mongoose.Types.ObjectId(),
  },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("Connected to DB...");

    // Clear existing listings
    await Listing.deleteMany({});
    console.log("Cleared existing listings...");

    // Insert new seed data
    await Listing.insertMany(seedListings);
    console.log("Seeded detailed listings!");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
