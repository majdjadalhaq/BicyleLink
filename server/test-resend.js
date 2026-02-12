
import mongoose from "mongoose";
import User from "./src/models/User.js";
import { resendVerificationCode, createUser } from "./src/controllers/user.js";
import dotenv from "dotenv";

dotenv.config({ path: "server/.env" });

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/c54-group-b";

// Mock Reponse Object
const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const runTest = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB for testing.");

    const testEmail = `test_resend_${Date.now()}@example.com`;
    console.log(`\nTesting with email: ${testEmail}`);

    // 1. Create User
    console.log("\n[1] Creating User...");
    const reqCreate = {
      body: {
        user: {
          name: "Resend Tester",
          email: testEmail,
          password: "password123",
          city: "TestCity",
          country: "TestCountry",
          agreedToTerms: true,
        },
      },
    };
    const resCreate = mockRes();
    await createUser(reqCreate, resCreate);
    if (resCreate.statusCode !== 201) {
        throw new Error(`Create failed: ${JSON.stringify(resCreate.body)}`);
    }
    console.log("User created.");

    // 2. Resend Immediately (Should FAIL due to 60s cooldown from creation?)
    // Wait, createUser sets verificationCodeExpiry but DOES NOT set verificationCodeLastSentAt?
    // Let's check logic.
    // If createUser sends email, does it set lastSentAt?
    // In createUser: sendVerificationEmail is called.
    // BUT we didn't add lastSentAt logic to createUser!
    // Ah! Should we?
    // If we don't, then first resend works immediately.
    // Which is fine.
    
    console.log("\n[2] First Resend (Should Success)...");
    const reqResend1 = { body: { email: testEmail } };
    const resResend1 = mockRes();
    await resendVerificationCode(reqResend1, resResend1);
    console.log(`Status: ${resResend1.statusCode}, Msg: ${resResend1.body.msg}`);
    if (resResend1.statusCode !== 200) throw new Error("First resend failed");

    // 3. Resend Immediately (Should FAIL - 429 Cooldown)
    console.log("\n[3] Immediate Second Resend (Should Fail 429)...");
    const resResend2 = mockRes();
    await resendVerificationCode(reqResend1, resResend2);
    console.log(`Status: ${resResend2.statusCode}, Msg: ${resResend2.body.msg}`);
    if (resResend2.statusCode !== 429) throw new Error("Cooldown check failed");

    // 4. Manually Expire Cooldown
    console.log("\n[4] Mocking Time Passing (61s)...");
    let user = await User.findOne({ email: testEmail });
    user.verificationCodeLastSentAt = new Date(Date.now() - 61000);
    await user.save();

    // 5. Resend (Should Success - Count = 2)
    console.log("\n[5] Resend after cooldown (Should Success)...");
    const resResend3 = mockRes();
    await resendVerificationCode(reqResend1, resResend3);
    console.log(`Status: ${resResend3.statusCode}, Msg: ${resResend3.body.msg}`);
    if (resResend3.statusCode !== 200) throw new Error("Resend after cooldown failed");

    // 6. Mock Time -> Resend (Count = 3)
    user = await User.findOne({ email: testEmail });
    user.verificationCodeLastSentAt = new Date(Date.now() - 61000);
    await user.save();

    console.log("\n[6] Resend 3rd time (Should Success)...");
    const resResend4 = mockRes();
    await resendVerificationCode(reqResend1, resResend4);
    if (resResend4.statusCode !== 200) throw new Error("3rd resend failed");

    // 7. Mock Time -> Resend (Count = 4 -> FAIL 429 Rate Limit)
    user = await User.findOne({ email: testEmail });
    user.verificationCodeLastSentAt = new Date(Date.now() - 61000);
    await user.save(); 

    console.log("\n[7] Resend 4th time (Should Fail 429 Rate Limit)...");
    const resResend5 = mockRes();
    await resendVerificationCode(reqResend1, resResend5);
    console.log(`Status: ${resResend5.statusCode}, Msg: ${resResend5.body.msg}`);
    if (resResend5.statusCode !== 429) throw new Error("Rate limit cap failed");

    // 8. Mock Window Expiry (1 hour passed)
    console.log("\n[8] Mocking 1 Hour Passing...");
    user = await User.findOne({ email: testEmail });
    user.verificationResendWindowStart = new Date(Date.now() - 3600001); // 1h 1ms ago
    await user.save();

    // 9. Resend (Should Success - Reset)
    console.log("\n[9] Resend after window reset (Should Success)...");
    const resResend6 = mockRes();
    await resendVerificationCode(reqResend1, resResend6);
    console.log(`Status: ${resResend6.statusCode}, Msg: ${resResend6.body.msg}`);
    if (resResend6.statusCode !== 200) throw new Error("Window reset failed");

    console.log("\n✅ ALL RESEND TESTS PASSED!");

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
  } finally {
    await mongoose.disconnect();
  }
};

runTest();
