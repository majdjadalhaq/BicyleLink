
import mongoose from "mongoose";
import User from "./src/models/User.js";
import { createUser, loginUser, requestPasswordReset, resetPassword } from "./src/controllers/user.js";
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
  res.cookie = () => {}; 
  return res;
};

const runTest = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB for testing.");

    const testEmail = `test_reset_${Date.now()}@example.com`;
    const oldPassword = "oldPassword123";
    const newPassword = "newPassword456";

    // 1. Create User
    console.log(`\n[1] Creating User: ${testEmail}`);
    const reqCreate = {
      body: {
        user: {
          name: "Reset Tester",
          email: testEmail,
          password: oldPassword,
          city: "TestCity",
          country: "TestCountry",
          agreedToTerms: true,
        },
      },
    };
    await createUser(reqCreate, mockRes());
    
    // Set Verified manually
    await User.updateOne({ email: testEmail }, { isVerified: true });
    console.log("User created and verified.");

    // 2. Request Reset
    console.log("\n[2] Requesting Password Reset...");
    const reqRequest = { body: { email: testEmail } };
    const resRequest = mockRes();
    await requestPasswordReset(reqRequest, resRequest);
    
    if (resRequest.statusCode !== 200) {
        throw new Error(`Request failed: ${JSON.stringify(resRequest.body)}`);
    }
    console.log("Reset code sent (simulated).");

    // Fetch Code from DB
    const user = await User.findOne({ email: testEmail }).select("+passwordResetCode");
    const code = user.passwordResetCode;
    console.log(`Code fetched from DB: ${code}`);

    // 3. Reset with WRONG Code
    console.log("\n[3] Attempting Reset with WRONG code...");
    const reqWrong = { 
        body: { email: testEmail, code: "000000", newPassword } 
    };
    const resWrong = mockRes();
    await resetPassword(reqWrong, resWrong);
    if (resWrong.statusCode !== 400) {
        throw new Error("Wrong code should fail with 400");
    }
    console.log("Wrong code rejected as expected.");

    // 4. Reset with CORRECT Code
    console.log("\n[4] Attempting Reset with CORRECT code...");
    const reqRight = { 
        body: { email: testEmail, code, newPassword } 
    };
    const resRight = mockRes();
    await resetPassword(reqRight, resRight);
    
    if (resRight.statusCode !== 200) {
        throw new Error(`Reset failed: ${JSON.stringify(resRight.body)}`);
    }
    console.log("Password reset successful.");

    // 5. Login with OLD Password (Should Fail)
    console.log("\n[5] Login with OLD Password (Should Fail)...");
    const reqLoginOld = { body: { email: testEmail, password: oldPassword } };
    const resLoginOld = mockRes();
    await loginUser(reqLoginOld, resLoginOld);
    if (resLoginOld.statusCode !== 401) {
        throw new Error("Old password should not work!");
    }
    console.log("Old password rejected.");

    // 6. Login with NEW Password (Should Success)
    console.log("\n[6] Login with NEW Password (Should Success)...");
    const reqLoginNew = { body: { email: testEmail, password: newPassword } };
    const resLoginNew = mockRes();
    await loginUser(reqLoginNew, resLoginNew);
    if (resLoginNew.statusCode !== 200) {
        throw new Error("New password failed to login!");
    }
    console.log("New password login successful.");

    console.log("\n✅ ALL PASSWORD RESET TESTS PASSED!");

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runTest();
