/* eslint-disable no-console */
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../db/connectDB.js";

dotenv.config();

const seedTestUsers = async () => {
  try {
    await connectDB();

    const testUsers = [
      {
        name: "TestBuyer",
        email: "testbuyer@bicyclel.com",
        password: "Buyer123!",
        role: "user",
        city: "Amsterdam",
        country: "Netherlands",
        bio: "Looking for a great bike deal!",
      },
      {
        name: "TestSeller",
        email: "testseller@bicyclel.com",
        password: "Seller123!",
        role: "user",
        city: "Rotterdam",
        country: "Netherlands",
        bio: "Selling quality bikes since 2020.",
      },
    ];

    for (const userData of testUsers) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        // Ensure verified and update password in case it changed
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(userData.password, salt);
        await User.findOneAndUpdate(
          { email: userData.email },
          { $set: { isVerified: true, password: hashed, role: userData.role } },
        );
        console.log(`[UPDATED] ${userData.name} (${userData.email})`);
      } else {
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(userData.password, salt);
        await User.create({
          ...userData,
          password: hashed,
          isVerified: true,
          agreedToTerms: true,
        });
        console.log(`[CREATED] ${userData.name} (${userData.email})`);
      }
    }

    console.log("\n=================================");
    console.log("      TEST ACCOUNTS READY");
    console.log("=================================");
    console.log("\n🧑 BUYER");
    console.log("  Email:    testbuyer@bicyclel.com");
    console.log("  Password: Buyer123!");
    console.log("\n🛒 SELLER");
    console.log("  Email:    testseller@bicyclel.com");
    console.log("  Password: Seller123!");
    console.log("\n🔑 ADMIN");
    console.log("  Email:    bicycle2026@gmail.com");
    console.log("  Password: (see original seedAdmin output — ask team)");
    console.log("=================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding test users:", error);
    process.exit(1);
  }
};

seedTestUsers();
