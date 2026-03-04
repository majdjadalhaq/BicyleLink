/* eslint-disable no-console */
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import User from "../models/User.js";
import connectDB from "../db/connectDB.js";

dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });

const seedAdmin = async () => {
  try {
    await connectDB();

    console.log("Checking for admin existence...");

    const adminEmail = "bicycle2026@gmail.com";

    // Generate a strong, secure password
    const rawPassword =
      "Bicycle_" + Math.random().toString(36).slice(-10) + "_Admin#2026";
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    // Upsert query: if email exists, only ensure role="admin".
    // If it DOES NOT exist, create it with these exact details.
    const result = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        $setOnInsert: {
          name: "BiCycleL",
          email: adminEmail,
          password: hashedPassword,
          agreedToTerms: true,
        },
        $set: {
          role: "admin",
          isVerified: true, // Ensure admin avoids verification flow lockouts
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    console.log("\n=================================");
    console.log("      ADMIN SETUP COMPLETE");
    console.log("=================================");

    if (result.createdAt === result.updatedAt) {
      console.log("[NEW] Admin account created.");
      console.log("Username: BiCycleL");
      console.log(`Email:    ${adminEmail}`);
      console.log(`Password: ${rawPassword}`);
      console.log("\n⚠️ IMPORTANT: SAVE THIS PASSWORD SOMEWHERE SAFE!");
    } else {
      console.log("[EXISTING] Admin account updated and ensured.");
      console.log(`Email: ${adminEmail}`);
      console.log(
        "Role firmly set to admin. Password remains unchanged if it existed.",
      );
    }

    console.log("=================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Critical Error seeding admin account: ", error);
    process.exit(1);
  }
};

seedAdmin();
