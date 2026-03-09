import express from "express";
import mongoose from "mongoose";
import User from "./models/User.js";
import Listing from "./models/Listing.js";
import bcrypt from "bcrypt";

import { logError } from "./utils/logging.js";

const testRouter = express.Router();

testRouter.post("/seed", async (req, res) => {
  if (
    !process.env.MONGODB_URL.includes("cypressDatabase") &&
    !process.env.MONGODB_URL.includes("c54-group-b")
  ) {
    const msg =
      "The database you are trying to seed is not the cypress database! Did you forget to change your .env variable?";
    logError(msg);

    res.status(400).json({
      success: false,
      msg,
    });
  } else {
    await emptyDatabase();

    const data = {
      users: [
        {
          name: "Seller Sam",
          email: "seller@test.com",
          password: "Password123",
          city: "Amsterdam",
          country: "Netherlands",
          agreedToTerms: true,
          isVerified: true,
        },
        {
          name: "Buyer Ben",
          email: "buyer@test.com",
          password: "Password123",
          city: "Rotterdam",
          country: "Netherlands",
          agreedToTerms: true,
          isVerified: true,
        },
        {
          name: "System Admin",
          email: process.env.TEST_ADMIN_EMAIL || "bicyclel2026@gmail.com",
          password: process.env.TEST_ADMIN_PASSWORD || "AdminRide2026!",
          city: "Amsterdam",
          country: "Netherlands",
          agreedToTerms: true,
          isVerified: true,
          role: "admin",
        },
        {
          name: "Teammate Tom",
          email: "teammate@test.com",
          password: "Password123",
          city: "Amsterdam",
          country: "Netherlands",
          agreedToTerms: true,
          isVerified: true,
          role: "admin",
        },
      ],
    };

    // Hash passwords for seed users
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = await Promise.all(
      data.users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, salt),
      })),
    );

    // Add users to the database
    const createdUsers = await User.create(hashedUsers);

    // Add a listing for the seller
    const listing = await Listing.create({
      title: "Vintage Gazelle Bike",
      description: "A beautiful vintage Gazelle bike in excellent condition.",
      price: 250,
      location: "Amsterdam",
      coordinates: {
        type: "Point",
        coordinates: [4.8952, 52.3702], // Amsterdam [lng, lat]
      },
      brand: "Gazelle",
      condition: "good",
      category: "City",
      ownerId: createdUsers[0]._id, // Sam
    });

    const Message = mongoose.model("Message");
    const room = `${createdUsers[0]._id}-${createdUsers[1]._id}-${listing._id}`;

    // Add some initial messages
    await Message.create([
      {
        senderId: createdUsers[1]._id, // Ben
        receiverId: createdUsers[0]._id, // Sam
        listingId: listing._id,
        room: room,
        content: "Hi Sam, is this bike still available?",
        read: false,
      },
      {
        senderId: createdUsers[0]._id, // Sam
        receiverId: createdUsers[1]._id, // Ben
        listingId: listing._id,
        room: room,
        content: "Yes Ben! It is.",
        read: true,
      },
    ]);

    // Fetch to add to the return
    const finalUsers = await User.find();
    const finalListings = await Listing.find();

    res.status(201).json({
      success: true,
      data: {
        users: finalUsers,
        listings: finalListings,
      },
    });
  }
});

testRouter.post("/verify-user", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );
    // eslint-disable-next-line no-console
    console.log(`[TEST] Verified user: ${email}, found: ${!!user}`);
    res.status(200).json({ success: true, found: !!user });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[TEST] Verification error: ${err.message}`);
    res.status(500).json({ success: false });
  }
});

testRouter.get("/get-last-code", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email }).select(
      "+verificationCode +securityCode +passwordResetCode",
    );
    res.status(200).json({
      success: true,
      verificationCode: user?.verificationCode,
      securityCode: user?.securityCode,
      passwordResetCode: user?.passwordResetCode,
    });
  } catch {
    res.status(500).json({ error: "Failed to seed test users" });
  }
});

const emptyDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export default testRouter;
