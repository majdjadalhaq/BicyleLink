import express from "express";
import mongoose from "mongoose";
import User from "./models/User.js";
import Listing from "./models/Listing.js";
import bcrypt from "bcrypt";

import { logError } from "./util/logging.js";

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
      sucess: false,
      msg,
    });
  } else {
    await emptyDatabase();

    const data = {
      users: [
        {
          name: "Seller Sam",
          email: "seller@test.com",
          password: "Password123!",
          city: "Amsterdam",
          country: "Netherlands",
          agreedToTerms: true,
          isVerified: true,
        },
        {
          name: "Buyer Ben",
          email: "buyer@test.com",
          password: "Password123!",
          city: "Rotterdam",
          country: "Netherlands",
          agreedToTerms: true,
          isVerified: true,
        },
        {
          name: "Teammate Tom",
          email: "teammate@test.com",
          password: "Password123!",
          city: "Amsterdam",
          country: "Netherlands",
          agreedToTerms: true,
          isVerified: true,
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
    await Listing.create({
      title: "Vintage Gazelle Bike",
      description: "A beautiful vintage Gazelle bike in excellent condition.",
      price: 250,
      location: "Amsterdam",
      brand: "Gazelle",
      condition: "good",
      ownerId: createdUsers[0]._id, // First user is the seller
    });

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

const emptyDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export default testRouter;
