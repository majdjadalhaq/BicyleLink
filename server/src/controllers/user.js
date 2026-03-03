import mongoose from "mongoose";
import User, { validateUser } from "../models/User.js";
import Listing from "../models/Listing.js";
import Review from "../models/Review.js";
import { logError } from "../utils/logging.js";
import validationErrorMessage from "../utils/validationErrorMessage.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { signToken, verifyToken, cookieConfig } from "../config/jwt.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSecurityCodeEmail,
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

    // Normalize boolean values for consistency
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
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const userPayload = {
      ...user,
      password: hashedPassword,
      isVerified: false,
      verificationCode: crypto.randomInt(100000, 999999).toString(),
      verificationCodeExpiry: Date.now() + 15 * 60 * 1000, // Code valid for 15 minutes
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
      if (error.code === 11000) {
        if (error.keyPattern && error.keyPattern.name) {
          return res
            .status(400)
            .json({ success: false, msg: "Username is already taken" });
        }
        if (error.keyPattern && error.keyPattern.email) {
          return res
            .status(400)
            .json({ success: false, msg: "Email is already taken" });
        }
      }
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

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        msg: "Your account has been blocked by an administrator.",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        msg: `Account temporarily locked due to failed security checks. Try again in ${remainingTime} minutes.`,
      });
    }

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = Date.now() + 15 * 60 * 1000; // Account locked for 15 minutes
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    const { rememberMe } = req.body;
    const currentCookieConfig = { ...cookieConfig };
    if (rememberMe) {
      currentCookieConfig.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    // Ensure email is verified
    if (user.isVerified !== true) {
      // Regenerate code and send email again automatically
      const newCode = crypto.randomInt(100000, 999999).toString();
      user.verificationCode = newCode;
      user.verificationCodeExpiry = Date.now() + 15 * 60 * 1000;
      await user.save();

      try {
        await sendVerificationEmail(user.email, newCode);
      } catch (error) {
        logError(error);
      }

      return res.status(403).json({
        success: false,
        msg: "Please verify your email first. A new code has been sent to your inbox.",
        necessitatesVerification: true,
        email: user.email,
      });
    }

    // Success - Reset counters
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    await user.save();

    const token = signToken(user);
    res.cookie("token", token, currentCookieConfig);

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

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, msg: "No Google token provided" });
    }

    let payload;
    try {
      // Typically, access tokens can't be strictly verified with just verifyIdToken,
      // but react-oauth/google returns an access token if you use useGoogleLogin.
      // We must fetch from Google userinfo endpoint if it's an access token.
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Google profile");
      }
      payload = await response.json();
    } catch (err) {
      logError(err);
      return res
        .status(401)
        .json({ success: false, msg: "Invalid Google token" });
    }

    const { email, name, picture, sub: googleId } = payload;
    const sanitizedName = name
      ? name.replace(/[^a-zA-Z0-9 _-]/g, "")
      : email.split("@")[0].replace(/[^a-zA-Z0-9 _-]/g, "");

    // Ensure name is at least 3 chars and unique (by adding random suffix)
    let finalName = sanitizedName;
    if (finalName.length < 3) finalName = (finalName + "User").slice(0, 10);
    finalName = `${finalName.slice(0, 20)}_${crypto.randomInt(1000, 9999)}`;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user && user.isBlocked) {
      return res.status(403).json({
        success: false,
        msg: "Your account has been blocked by an administrator.",
      });
    }

    if (!user) {
      // Create new user if they don't exist
      // Give them a random password since they use Google
      const salt = await bcrypt.genSalt(12);
      const randomPassword = await bcrypt.hash(
        crypto.randomBytes(16).toString("hex"),
        salt,
      );
      try {
        user = await User.create({
          name: finalName,
          email,
          password: randomPassword,
          avatarUrl: picture,
          authProvider: "google",
          googleId,
          isVerified: true, // Google emails are already verified
          agreedToTerms: true,
        });
      } catch (createErr) {
        logError(createErr, "User.create failed in Google Login");
        // If it's a conflict on name, retry with a different name or handled as 500 with better msg
        if (createErr.code === 11000) {
          return res.status(409).json({
            success: false,
            msg: "A conflict occurred during account creation. Please try again.",
          });
        }
        throw createErr;
      }
    } else {
      // Update existing user with googleId if it doesn't have one
      if (!user.googleId) {
        user.googleId = googleId;
        // We aren't strictly enforcing googleId in schema, but we mark them verified.
        if (!user.isVerified) {
          user.isVerified = true;
          user.verificationCode = undefined;
          user.verificationCodeExpiry = undefined;
        }
        await user.save();
      }
    }

    // Reset counters just in case
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    await user.save();

    // Set cookie
    const jwtToken = signToken(user);
    res.cookie("token", jwtToken, cookieConfig);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationCode;

    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    logError(error, "googleLogin main catch");
    res.status(500).json({
      success: false,
      msg: "Internal server error during Google login",
      error: error.message, // Temporarily expose for debugging
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
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
      "+verificationCode +verificationCodeExpiry +failedAttempts +lockoutUntil",
    );

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        msg: `Too many failed attempts. Please try again in ${remainingTime} minutes.`,
      });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, msg: "User already verified" });
    }

    if (user.verificationCode !== code) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      if (user.failedAttempts >= 5) {
        user.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 mins
        user.failedAttempts = 0; // Reset after lockout
      }
      await user.save();
      return res.status(400).json({ success: false, msg: "Invalid code" });
    }

    if (Date.now() > user.verificationCodeExpiry) {
      return res.status(400).json({ success: false, msg: "Code expired" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    user.failedAttempts = 0;
    user.lockoutUntil = undefined;
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
      "+isVerified +verificationCodeLastSentAt +verificationResendCount +verificationResendWindowStart +lockoutUntil",
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

    // Lockout Check
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        msg: `Action restricted. Please try again in ${remainingTime} minutes.`,
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

    // Lockout Check
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        msg: `Action restricted. Please try again in ${remainingTime} minutes.`,
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
      "+passwordResetCode +passwordResetCodeExpiry +passwordResetCodeUsed +failedPasswordResetAttempts +lockoutUntil",
    );

    // Generic error for security
    const invalidRequest = () =>
      res.status(400).json({ success: false, msg: "Invalid or expired code" });

    if (!user) {
      return invalidRequest();
    }

    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        msg: `Too many failed attempts. Please try again in ${remainingTime} minutes.`,
      });
    }

    if (
      user.passwordResetCode !== code ||
      Date.now() > user.passwordResetCodeExpiry ||
      user.passwordResetCodeUsed
    ) {
      user.failedPasswordResetAttempts =
        (user.failedPasswordResetAttempts || 0) + 1;
      if (user.failedPasswordResetAttempts >= 5) {
        user.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 mins
        user.failedPasswordResetAttempts = 0;
      }
      await user.save();
      return invalidRequest();
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiry = undefined;
    user.passwordResetCodeUsed = true;
    user.failedPasswordResetAttempts = 0;
    user.lockoutUntil = undefined;

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
      return res.status(200).json({ success: false, msg: "Not authenticated" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(200).json({ success: false, msg: "Invalid token" });
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

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, country, city, bio, avatarUrl } = req.body;

    // Check if name is being changed and if it's already taken
    if (name && name !== req.user.name) {
      const existingUser = await User.findOne({ name });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, msg: "Username is already taken" });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, country, city, bio, avatarUrl },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to update profile" });
  }
};

export const requestSecurityCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    user.securityCode = crypto.randomInt(100000, 999999).toString();
    user.securityCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    try {
      await sendSecurityCodeEmail(user.email, user.securityCode);
    } catch (err) {
      logError(err);
    }

    res
      .status(200)
      .json({ success: true, msg: "Security code sent to your email" });
  } catch (err) {
    logError(err);
    res
      .status(500)
      .json({ success: false, msg: "Unable to request security code" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: "Security code and new password are required",
      });
    }

    const user = await User.findById(userId).select(
      "+password +securityCode +securityCodeExpiry +lockoutUntil +failedPasswordResetAttempts",
    );
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      return res
        .status(429)
        .json({ success: false, msg: "Account locked temporarily" });
    }

    if (
      !user.securityCode ||
      user.securityCode !== code ||
      Date.now() > user.securityCodeExpiry
    ) {
      user.failedPasswordResetAttempts =
        (user.failedPasswordResetAttempts || 0) + 1;
      if (user.failedPasswordResetAttempts >= 5) {
        user.lockoutUntil = Date.now() + 15 * 60 * 1000;
        user.failedPasswordResetAttempts = 0;
      }
      await user.save();
      return res
        .status(401)
        .json({ success: false, msg: "Invalid or expired security code" });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.securityCode = undefined;
    user.securityCodeExpiry = undefined;
    user.failedPasswordResetAttempts = 0;
    user.lockoutUntil = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, msg: "Password updated successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to change password" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code)
      return res.status(400).json({
        success: false,
        msg: "Security code required to delete account",
      });

    const user = await User.findById(userId).select(
      "+securityCode +securityCodeExpiry",
    );
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    if (
      !user.securityCode ||
      user.securityCode !== code ||
      Date.now() > user.securityCodeExpiry
    ) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid or expired security code" });
    }

    await User.findByIdAndDelete(userId);

    res.clearCookie("token", cookieConfig);
    res
      .status(200)
      .json({ success: true, msg: "Account deleted successfully" });
  } catch (err) {
    logError(err);
    res.status(500).json({ success: false, msg: "Unable to delete account" });
  }
};

export const requestEmailChange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail } = req.body;

    if (!newEmail)
      return res
        .status(400)
        .json({ success: false, msg: "New email is required" });

    // Check if email is already taken
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, msg: "Email is already in use" });

    const user = await User.findById(userId);
    user.pendingEmail = newEmail;
    user.securityCode = crypto.randomInt(100000, 999999).toString();
    user.securityCodeExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendSecurityCodeEmail(newEmail, user.securityCode);

    res.status(200).json({
      success: true,
      msg: "Security code sent to your new email address",
    });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to request email change" });
  }
};

export const verifyEmailChange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code)
      return res
        .status(400)
        .json({ success: false, msg: "Verification code is required" });

    const user = await User.findById(userId).select(
      "+securityCode +securityCodeExpiry +pendingEmail",
    );

    if (!user.pendingEmail)
      return res
        .status(400)
        .json({ success: false, msg: "No pending email change request found" });

    if (
      !user.securityCode ||
      user.securityCode !== code ||
      Date.now() > user.securityCodeExpiry
    ) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid or expired verification code" });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.securityCode = undefined;
    user.securityCodeExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Email updated successfully",
      email: user.email,
    });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to verify email change" });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        msg: "Settings object is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Update settings selectively to ensure partial updates are reliable
    if (!user.notificationSettings) {
      user.notificationSettings = {};
    }

    Object.keys(settings).forEach((key) => {
      user.notificationSettings[key] = settings[key];
    });

    // Mark as modified if using sub-document object
    user.markModified("notificationSettings");
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Notification settings updated",
      settings: user.notificationSettings,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to update notification settings",
    });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    let user = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id).select(
        "-password -verificationCode -verificationCodeExpiry -securityCode -securityCodeExpiry -pendingEmail",
      );
    }

    if (!user) {
      user = await User.findOne({ name: id }).select(
        "-password -verificationCode -verificationCodeExpiry -securityCode -securityCodeExpiry -pendingEmail",
      );
    }

    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    const userId = user._id;

    // Fetch listings
    const listings = await Listing.find({ ownerId: userId }).sort("-createdAt");

    // Fetch reviews received
    const reviewsReceived = await Review.find({ targetId: userId })
      .populate("reviewerId", "name avatarUrl")
      .sort("-createdAt");

    // Fetch reviews given
    const reviewsGiven = await Review.find({ reviewerId: userId })
      .populate("targetId", "name avatarUrl")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      user,
      listings,
      reviewsReceived,
      reviewsGiven,
    });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to fetch profile details" });
  }
};
