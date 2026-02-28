import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Review from "../models/Review.js";
import Report from "../models/Report.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import connectDB from "../db/connectDB.js";

dotenv.config();

// Realistic data pools for generation
const cities = [
  { name: "Amsterdam", country: "Netherlands", coords: [4.8952, 52.3702] },
  { name: "Rotterdam", country: "Netherlands", coords: [4.4777, 51.9225] },
  { name: "Utrecht", country: "Netherlands", coords: [5.1214, 52.0907] },
  { name: "Berlin", country: "Germany", coords: [13.405, 52.52] },
  { name: "Paris", country: "France", coords: [2.3522, 48.8566] },
  { name: "London", country: "UK", coords: [-0.1276, 51.5074] },
  { name: "New York", country: "USA", coords: [-74.006, 40.7128] },
  { name: "Tokyo", country: "Japan", coords: [139.6917, 35.6895] },
  { name: "Copenhagen", country: "Denmark", coords: [12.5683, 55.6761] },
  { name: "Barcelona", country: "Spain", coords: [2.1734, 41.3851] },
];

const bikeBrands = [
  "Specialized",
  "Canyon",
  "Giant",
  "Trek",
  "Cannondale",
  "Bianchi",
  "VanMoof",
  "Brompton",
  "Santa Cruz",
  "Scott",
];
const bikeCategories = [
  "Road",
  "Mountain",
  "City",
  "E-bike",
  "Gravel",
  "Hybrid",
  "Kids",
  "Fixed Gear",
  "Cruiser",
  "Other",
];
const conditions = ["new", "like-new", "good", "fair", "poor"];
const firstNames = [
  "Lukas",
  "Sophie",
  "Hans",
  "Emma",
  "Mark",
  "Julia",
  "Daan",
  "Anouk",
  "Thomas",
  "Lieke",
  "James",
  "Elena",
  "Kenji",
  "Mateo",
  "Chloe",
];
const lastNames = [
  "de Vries",
  "Jansen",
  "Bakker",
  "Smit",
  "Vermeulen",
  "Muller",
  "Schmidt",
  "Smith",
  "Johnson",
  "Tanaka",
  "Garcia",
];

const bikeImages = [
  "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532124958905-df1fd300a20b?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571068316341-21bc1428a294?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593761781203-f142999e8293?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501147830916-ce44a6359892?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529422643029-d4585747aaf2?q=80&w=1000&auto=format&fit=crop",
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const seedDemoData = async () => {
  try {
    await connectDB();
    /* eslint-disable no-console */
    console.log("🚀 Starting GIGANTIC demo seed...");

    // 1. CLEAR COLLECTIONS
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Review.deleteMany({}),
      Report.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log("🧹 Database cleared.");

    // 2. CREATE 50 USERS
    console.log("👤 Creating 50 unique users...");
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    const users = [];

    // Add 1 Admin
    users.push(
      await User.create({
        name: "BiCycleL Admin",
        email: "admin@bicyclel.nl",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        avatarUrl: "https://i.pravatar.cc/300?u=admin",
        city: "Amsterdam",
        country: "Netherlands",
      }),
    );

    for (let i = 0; i < 49; i++) {
      const cityData = getRandom(cities);
      const name = `${getRandom(firstNames)} ${getRandom(lastNames)} ${i}`;
      users.push(
        await User.create({
          name,
          email: `user${i}@bicyclel.nl`,
          password: hashedPassword,
          city: cityData.name,
          country: cityData.country,
          isVerified: true,
          avatarUrl: `https://i.pravatar.cc/300?u=user${i}`,
          bio: `I love cycling in ${cityData.name}. Looking for the best deals on the platform!`,
        }),
      );
    }
    console.log("✅ 50 Users created.");

    // 3. CREATE 200 LISTINGS
    console.log("🚲 Creating 200 global listings...");
    const listings = [];
    for (let i = 0; i < 200; i++) {
      const owner = getRandom(users);
      const cityData = getRandom(cities);
      const brand = getRandom(bikeBrands);
      const category = getRandom(bikeCategories);

      // Randomly offset coordinates slightly so they don't overlap exactly on map
      const lng = cityData.coords[0] + (Math.random() - 0.5) * 0.1;
      const lat = cityData.coords[1] + (Math.random() - 0.5) * 0.1;

      listings.push(
        await Listing.create({
          title: `${brand} ${category} Bike ${i}`,
          description: `This high-performance ${brand} is perfect for your commute or weekend adventures. Well maintained and ready for a new owner.`,
          price: getRandomInt(200, 5000),
          location: `${cityData.name}, ${cityData.country}`,
          coordinates: { type: "Point", coordinates: [lng, lat] },
          brand,
          model: `Model ${getRandomInt(1, 9)}`,
          year: getRandomInt(2015, 2024),
          category,
          condition: getRandom(conditions),
          status: Math.random() > 0.15 ? "active" : "sold",
          ownerId: owner._id,
          images: [getRandom(bikeImages), getRandom(bikeImages)].slice(
            0,
            getRandomInt(1, 2),
          ),
          views: getRandomInt(50, 1000),
          inquiries: getRandomInt(0, 15),
          createdAt: new Date(
            Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000,
          ),
        }),
      );
    }
    console.log("✅ 200 Listings created.");

    // 4. CREATE 100 CONVERSATIONS (MESSAGES)
    console.log("💬 Creating 100 random conversations...");
    for (let i = 0; i < 100; i++) {
      const sender = getRandom(users);
      let receiver = getRandom(users);
      while (receiver._id === sender._id) receiver = getRandom(users);

      const listing = getRandom(listings);
      const room = [sender._id, receiver._id].sort().join("_");

      await Message.create([
        {
          senderId: sender._id,
          receiverId: receiver._id,
          listingId: listing._id,
          content: "Is this still available?",
          room,
        },
        {
          senderId: receiver._id,
          receiverId: sender._id,
          listingId: listing._id,
          content: "Yes it is! Are you interested in a test ride?",
          room,
        },
      ]);
    }
    console.log("✅ 100 Conversations created.");

    // 5. CREATE 50 REVIEWS
    console.log("⭐ Creating 50 reviews...");
    for (let i = 0; i < 50; i++) {
      const reviewer = getRandom(users);
      const seller = getRandom(users);
      const listing = getRandom(listings);
      if (reviewer._id.equals(seller._id)) continue;

      await Review.create({
        reviewerId: reviewer._id,
        targetId: seller._id,
        listingId: listing._id,
        rating: getRandomInt(3, 5),
        comment:
          "Great experience with this seller. Quick response and the bike was as described.",
      });

      // Update seller stats
      seller.ratingSum += 5;
      seller.reviewCount += 1;
      await seller.save();
    }
    console.log("✅ 50 Reviews created.");

    // 6. CREATE 20 REPORTS (FOR ADMIN DEMO)
    console.log("🚩 Creating 20 reports...");
    for (let i = 0; i < 20; i++) {
      const reporter = getRandom(users);
      const target = getRandom(listings);
      await Report.create({
        reporterId: reporter._id,
        targetId: target._id,
        targetType: "Listing",
        reason: "Incorrect category or misleading price.",
        status: i < 10 ? "pending" : "resolved",
      });
    }
    console.log("✅ 20 Reports created.");

    // 7. CREATE 150 NOTIFICATIONS
    console.log("🔔 Creating 150 notifications...");
    for (let i = 0; i < 150; i++) {
      const recipient = getRandom(users);
      const sender = getRandom(users);
      const types = ["message", "favorite", "review"];
      const type = getRandom(types);

      await Notification.create({
        recipientId: recipient._id,
        senderId: sender._id,
        type,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        body: `You have a new ${type} from ${sender.name}.`,
        link: "/inbox",
        read: Math.random() > 0.7,
      });
    }
    console.log("✅ 150 Notifications created.");

    console.log("🌈 GIGANTIC DEMO SEED COMPLETED SUCCESSFULLY!");
    /* eslint-enable no-console */
    process.exit(0);
  } catch (error) {
    /* eslint-disable no-console */
    console.error("❌ Error during seed:", error);
    process.exit(1);
  }
};

seedDemoData();
