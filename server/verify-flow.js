
import axios from "axios";
import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:3000/api/users";

const run = async () => {
    console.log("Starting Verification Flow Test...");

    // 1. Connect DB to read code later
    if (!process.env.MONGODB_URL) {
        console.error("Missing MONGODB_URL");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URL);

    // 2. Signup
    const email = `flow${Date.now()}@test.com`;
    const userPayload = {
        user: {
            name: "FlowTester",
            email: email,
            password: "Password123!",
            city: "TestCity",
            country: "TestCountry",
            agreedToTerms: true
        }
    };

    try {
        console.log("1. Signing up...");
        const res = await axios.post(BASE_URL, userPayload);
        const userId = res.data.user._id;
        console.log("   Signup success. UserID:", userId);

        // 3. Get Code
        console.log("2. Retrieving Code from DB...");
        const user = await User.findOne({ email }).select("+verificationCode");
        if (!user) {
             throw new Error("User not found in DB");
        }
        const code = user.verificationCode;
        if (!code) {
             throw new Error("No verification code generated");
        }
        console.log("   Code:", code);

        // 4. Verify
        console.log("3. Verifying Email...");
        const verifyRes = await axios.post(`${BASE_URL}/verify`, {
            email: email,
            code: code
        });

        if (verifyRes.data.success && verifyRes.data.user.isVerified) {
            console.log("   Verification SUCCESS! User isVerified: true");
        } else {
            console.error("   Verification failed response:", verifyRes.data);
            process.exit(1);
        }

    } catch (e) {
        console.error("Test failed:", e.response?.data || e.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
