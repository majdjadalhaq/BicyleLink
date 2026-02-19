import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const migrate = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) throw new Error("MONGODB_URL is missing");

    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB for migration...");

    const result = await User.updateMany(
      { agreedToTerms: { $exists: false } },
      { $set: { agreedToTerms: true, isVerified: true } },
    );

    console.log(`Migration complete! Updated ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
