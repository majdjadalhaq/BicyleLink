import mongoose from "mongoose";
import User from "./src/models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: ".env" }); // Assuming running from server/

// Production guard - refuse to run in production
if (process.env.NODE_ENV === "production") {
  console.error("❌ ERROR: This script should not be run in production!");
  console.error("This creates a demo user with a known password.");
  process.exit(1);
}

const MONGODB_URL = process.env.MONGODB_URL;

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");

    const email = "demo@example.com";
    const password = "password123";

    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating demo user...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name: "Demo User",
        email,
        password: hashedPassword,
        city: "Demo City",
        country: "Demo Country",
        agreedToTerms: true,
        isVerified: true,
      });
      console.log(`Created new user: ${email}`);
    } else {
      console.log(`User already exists: ${email}`);
      // Reset password just in case
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.isVerified = true;
      await user.save();
      console.log("Password reset to default.");
    }

    console.log(`\n✅ CREDENTIALS READY:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
