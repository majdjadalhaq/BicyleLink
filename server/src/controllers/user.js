import User, { validateUser } from "../models/User.js";
import { logError } from "../util/logging.js";
import validationErrorMessage from "../util/validationErrorMessage.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { signToken, verifyToken, cookieConfig } from "../config/jwt.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/emailService.js";

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

export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, msg: "Email is required" });
    }

    const user = await User.findOne({ email }).select(
      "+isVerified +verificationCodeLastSentAt +verificationResendCount +verificationResendWindowStart",
    );

    // Anti-Enumeration: Fake delay & Generic Success
    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return res.status(200).json({
        success: true,
        msg: "If an account exists, a verification code has been sent.",
      });
    }

    // Already Verified: Generic Success
    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        msg: "If an account exists, a verification code has been sent.",
      });
    }

    // Cooldown Check (60 seconds)
    if (
      user.verificationCodeLastSentAt &&
      Date.now() - user.verificationCodeLastSentAt.getTime() < 60000
    ) {
      return res.status(429).json({
        success: false,
        msg: "Please wait before requesting another code.",
      });
    }

    // Rate Limit Reset (1 hour window)
    if (
      !user.verificationResendWindowStart ||
      Date.now() - user.verificationResendWindowStart.getTime() > 3600000
    ) {
      user.verificationResendCount = 0;
      user.verificationResendWindowStart = new Date();
    }

    // Rate Limit Cap (3 per hour)
    if (user.verificationResendCount >= 3) {
      return res.status(429).json({
        success: false,
        msg: "Too many requests. Please try again later.",
      });
    }

    // Action: Generate new code & Update state
    user.verificationCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    user.verificationCodeLastSentAt = new Date();
    user.verificationResendCount += 1;

    await user.save();

    // Send Email
    try {
      await sendVerificationEmail(user.email, user.verificationCode);
    } catch (err) {
      logError(err);
      // Log error but treat as success to client to avoid enumeration
    }

    return res.status(200).json({
      success: true,
      msg: "If an account exists, a verification code has been sent.",
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to resend code" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, msg: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Anti-Enumeration: Fake delay & Generic Success
    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return res.status(200).json({
        success: true,
        msg: "If an account exists, a reset code has been sent.",
      });
    }

    // Generate Code
    user.passwordResetCode = crypto.randomInt(100000, 999999).toString();
    user.passwordResetCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    user.passwordResetCodeUsed = false;
    await user.save();

    // Send Email
    try {
      await sendPasswordResetEmail(user.email, user.passwordResetCode);
    } catch (err) {
      logError(err);
    }

    return res.status(200).json({
      success: true,
      msg: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to request password reset" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }

    const user = await User.findOne({ email }).select(
      "+passwordResetCode +passwordResetCodeExpiry +passwordResetCodeUsed",
    );

    // Generic error for security (avoid leaking if code/email mismatch vs not found)
    const invalidRequest = () =>
      res.status(400).json({ success: false, msg: "Invalid or expired code" });

    if (!user) {
      return invalidRequest();
    }

    if (
      user.passwordResetCode !== code ||
      Date.now() > user.passwordResetCodeExpiry ||
      user.passwordResetCodeUsed
    ) {
      return invalidRequest();
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiry = undefined;
    user.passwordResetCodeUsed = true;

    await user.save();

    return res
      .status(200)
      .json({ success: true, msg: "Password updated successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to reset password" });
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, msg: "Not authenticated" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select(
      "-password -verificationCode -verificationCodeExpiry -passwordResetCode -passwordResetCodeExpiry -passwordResetCodeUsed",
    );
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    logError(error);
    // Only return 401 for expected auth failures, 500 for unexpected errors
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", cookieConfig);
    res.status(200).json({ success: true, msg: "Logged out successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to logout" });
  }
};
