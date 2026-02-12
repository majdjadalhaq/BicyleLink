import User, { validateUser } from "../models/User.js";
import { logError } from "../util/logging.js";
import validationErrorMessage from "../util/validationErrorMessage.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { signToken, cookieConfig } from "../config/jwt.js";
import { sendVerificationEmail } from "../utils/emailService.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, result: users });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to get users, try again later" });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = req.body?.user;

    if (typeof user !== "object") {
      return res.status(400).json({
        success: false,
        msg: `You need to provide a 'user' object. Received: ${JSON.stringify(
          user,
        )}`,
      });
    }

    // 1️⃣ Normalize boolean at controller boundary
    if (user.agreedToTerms !== undefined) {
      user.agreedToTerms = user.agreedToTerms === true;
    }

    const errorList = validateUser(user);

    if (errorList.length > 0) {
      return res
        .status(400)
        .json({ success: false, msg: validationErrorMessage(errorList) });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const userPayload = {
      ...user,
      password: hashedPassword,
      isVerified: false,
      verificationCode: crypto.randomInt(100000, 999999).toString(),
      verificationCodeExpiry: Date.now() + 15 * 60 * 1000, // 15 mins
    };

    const newUser = await User.create(userPayload);

    // Send verification email
    try {
      await sendVerificationEmail(newUser.email, userPayload.verificationCode);
    } catch (error) {
      logError(error);
    }

    // Remove sensitive data from response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.verificationCode;
    delete userResponse.verificationCodeExpiry;

    res.status(201).json({ success: true, user: userResponse });
  } catch (error) {
    logError(error);
    // Specifically handle mongoose validation errors or duplicate key errors as 400
    if (error.name === "ValidationError" || error.code === 11000) {
      return res.status(400).json({ success: false, msg: error.message });
    }
    res
      .status(500)
      .json({ success: false, msg: "Unable to create user, try again later" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Email and password are required" });
    }

    // 1. Lookup
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    // 2. Password Match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    // 3. Verified Guard (PR #1 requirement)
    if (user.isVerified !== true) {
      return res.status(403).json({
        success: false,
        msg: "Please verify your email first",
      });
    }

    const token = signToken(user);
    res.cookie("token", token, cookieConfig);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Internal server error during login" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, msg: "Email and code are required" });
    }

    const user = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeExpiry",
    );

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, msg: "User already verified" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, msg: "Invalid code" });
    }

    if (Date.now() > user.verificationCodeExpiry) {
      return res.status(400).json({ success: false, msg: "Code expired" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    const token = signToken(user);
    res.cookie("token", token, cookieConfig);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationCode;
    delete userResponse.verificationCodeExpiry;

    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Verification failed" });
  }
};
