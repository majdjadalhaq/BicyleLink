/**
 * Seed 3 dev accounts: user1@bicyclel.nl, user2@bicyclel.nl, admin@bicyclel.nl
 * All with password: Password123!
 * user1 gets multiple listings with varied details for filter/search testing.
 *
 * Run: cd server && node src/scripts/seedDevAccounts.js
 * Or: npm run seed:dev (from project root)
 */
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import connectDB from "../db/connectDB.js";

// Load .env from server/ when run via npm run seed:dev (cwd=server)
dotenv.config();

const PASSWORD = "Password123!";
const USERS = [
  { name: "User One", email: "user1@bicyclel.nl", role: "user" },
  { name: "User Two", email: "user2@bicyclel.nl", role: "user" },
  { name: "BiCycleL Admin", email: "admin@bicyclel.nl", role: "admin" },
];

const SAMPLE_IMAGE =
  "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1000&auto=format&fit=crop";

// user1's listings with varied details for filter/search testing
const USER1_LISTINGS = [
  {
    title: "Trek Domane SL 6 Road Bike",
    description:
      "Smooth-riding endurance road bike. Carbon frame, Shimano 105. Perfect for long rides.",
    price: 1899,
    location: "Amsterdam, Netherlands",
    coordinates: { type: "Point", coordinates: [4.8952, 52.3702] },
    brand: "Trek",
    model: "Domane SL 6",
    year: 2023,
    category: "Road",
    condition: "like-new",
    mileage: 1200,
    images: [SAMPLE_IMAGE],
  },
  {
    title: "Specialized Stumpjumper Comp Mountain",
    description:
      "All-mountain trail bike. 29er wheels, SRAM GX. Ready for technical trails.",
    price: 2499,
    location: "Utrecht, Netherlands",
    coordinates: { type: "Point", coordinates: [5.1214, 52.0907] },
    brand: "Specialized",
    model: "Stumpjumper Comp",
    year: 2022,
    category: "Mountain",
    condition: "good",
    mileage: 3500,
    images: [SAMPLE_IMAGE],
  },
  {
    title: "Gazelle CityZen C7 E-bike",
    description:
      "Dutch city e-bike. Bosch motor, 7-speed. Ideal for daily commute.",
    price: 2299,
    location: "Rotterdam, Netherlands",
    coordinates: { type: "Point", coordinates: [4.4777, 51.9225] },
    brand: "Gazelle",
    model: "CityZen C7",
    year: 2024,
    category: "E-bike",
    condition: "new",
    mileage: 50,
    images: [SAMPLE_IMAGE],
  },
  {
    title: "Giant TCR Advanced Gravel",
    description:
      "Lightweight gravel bike for mixed surfaces. Great on roads and light trails.",
    price: 1599,
    location: "Amsterdam, Netherlands",
    coordinates: { type: "Point", coordinates: [4.8945, 52.3685] },
    brand: "Giant",
    model: "TCR Advanced",
    year: 2021,
    category: "Gravel",
    condition: "fair",
    mileage: 8000,
    images: [SAMPLE_IMAGE],
  },
  {
    title: "Brompton M6L Folding Bike",
    description:
      "Compact fold in seconds. 6-speed. Perfect for multi-modal commuting.",
    price: 1399,
    location: "Amsterdam, Netherlands",
    coordinates: { type: "Point", coordinates: [4.896, 52.371] },
    brand: "Brompton",
    model: "M6L",
    year: 2023,
    category: "City",
    condition: "good",
    mileage: 500,
    images: [SAMPLE_IMAGE],
  },
  {
    title: "Canyon Spectral CF 8",
    description:
      "Full suspension enduro bike. 150mm travel. Climbs and descends like a dream.",
    price: 3299,
    location: "Utrecht, Netherlands",
    coordinates: { type: "Point", coordinates: [5.13, 52.095] },
    brand: "Canyon",
    model: "Spectral CF 8",
    year: 2023,
    category: "Mountain",
    condition: "like-new",
    mileage: 800,
    images: [SAMPLE_IMAGE],
  },
  {
    title: "Cube Hybrid ONE 400",
    description:
      "Hybrid bike with Bosch e-motor. Upright position. Great for city and light trails.",
    price: 1899,
    location: "Rotterdam, Netherlands",
    coordinates: { type: "Point", coordinates: [4.48, 51.925] },
    brand: "Cube",
    model: "Hybrid ONE 400",
    year: 2022,
    category: "Hybrid",
    condition: "good",
    mileage: 2200,
    images: [SAMPLE_IMAGE],
  },
  {
    title: "Scott Scale 970 Kids Bike",
    description:
      "Lightweight kids mountain bike. 24 inch wheels. Suitable for ages 8-12.",
    price: 449,
    location: "Amsterdam, Netherlands",
    coordinates: { type: "Point", coordinates: [4.892, 52.372] },
    brand: "Scott",
    model: "Scale 970",
    year: 2024,
    category: "Kids",
    condition: "new",
    mileage: 0,
    images: [SAMPLE_IMAGE],
  },
  {
    title: "Fixie Inc Fixed Gear",
    description:
      "Simple fixed gear bike. Single speed. Urban riding and track use.",
    price: 299,
    location: "Amsterdam, Netherlands",
    coordinates: { type: "Point", coordinates: [4.898, 52.369] },
    brand: "Fixie Inc",
    model: "Urban",
    year: 2020,
    category: "Fixed Gear",
    condition: "fair",
    mileage: 12000,
    images: [SAMPLE_IMAGE],
  },
];

const seedDevAccounts = async () => {
  try {
    await connectDB();
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    /* eslint-disable no-console */
    console.log("\n=== BiCycleL Dev Accounts Seed ===\n");

    // 1. Remove existing users (and their listings)
    const existingUsers = await User.find({
      email: { $in: USERS.map((u) => u.email) },
    });
    for (const u of existingUsers) {
      await Listing.deleteMany({ ownerId: u._id });
    }
    await User.deleteMany({ email: { $in: USERS.map((u) => u.email) } });
    console.log("Cleared existing dev accounts and their listings.");

    // 2. Create users
    const createdUsers = await User.create(
      USERS.map((u) => ({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        isVerified: true,
        agreedToTerms: true,
        city: "Amsterdam",
        country: "Netherlands",
      })),
    );

    const user1 = createdUsers.find((u) => u.email === "user1@bicyclel.nl");

    // 3. Create listings for user1
    const listings = await Listing.insertMany(
      USER1_LISTINGS.map((l) => ({
        ...l,
        ownerId: user1._id,
        status: "active",
      })),
    );

    console.log("\n✅ Created 3 users:");
    createdUsers.forEach((u) => {
      console.log(`   - ${u.email} (${u.role})`);
    });
    console.log(
      `\n✅ Created ${listings.length} listings for user1@bicyclel.nl`,
    );
    console.log(
      "\n   Categories: Road, Mountain, E-bike, Gravel, City, Hybrid, Kids, Fixed Gear",
    );
    console.log("   Conditions: new, like-new, good, fair");
    console.log("   Prices: €299 - €3299 | Years: 2020 - 2024");
    console.log("\n   Login with Password123! for all accounts.\n");

    process.exit(0);
    /* eslint-enable no-console */
  } catch (error) {
    /* eslint-disable no-console */
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seedDevAccounts();
