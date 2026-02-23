import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error("MONGODB_URL not found in environment");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB.");

    const password = "Password123!";
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const users = [
      {
        name: "Seller Test",
        email: "seller@test.com",
        password: hashedPassword,
        city: "Berlin",
        country: "Germany",
        isVerified: true,
        agreedToTerms: true,
      },
      {
        name: "Buyer Test",
        email: "buyer@test.com",
        password: hashedPassword,
        city: "Berlin",
        country: "Germany",
        isVerified: true,
        agreedToTerms: true,
      },
    ];

    for (const u of users) {
      console.log(`Processing ${u.email}...`);
      const result = await User.findOneAndUpdate(
        { email: u.email },
        {
          $set: {
            name: u.name,
            password: u.password,
            city: u.city,
            country: u.country,
            isVerified: true,
            agreedToTerms: true,
            failedLoginAttempts: 0,
            lockoutUntil: null,
            verificationCode: undefined, // Clear any pending verification
            verificationCodeExpiry: undefined,
          },
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
      );
      console.log(
        `✓ Upserted ${u.email} (ID: ${result._id}, Verified: ${result.isVerified})`,
      );
    }

    console.log("Verification checks completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error executing script:", error);
    process.exit(1);
  }
};

run();
