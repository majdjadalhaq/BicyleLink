import User, { validateUser } from "../../models/User.js";
import { logError } from "../../utils/logging.js";
import validationErrorMessage from "../../utils/validationErrorMessage.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { signToken, verifyToken, cookieConfig } from "../../config/jwt.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../utils/emailService.js";

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

    if (user.agreedToTerms !== undefined) {
      user.agreedToTerms = user.agreedToTerms === true;
    }

    const errorList = validateUser(user);

    if (errorList.length > 0) {
      return res
        .status(400)
        .json({ success: false, msg: validationErrorMessage(errorList) });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const userPayload = {
      ...user,
      password: hashedPassword,
      isVerified: false,
      verificationCode: crypto.randomInt(100000, 999999).toString(),
      verificationCodeExpiry: Date.now() + 15 * 60 * 1000,
    };

    const newUser = await User.create(userPayload);

    try {
      await sendVerificationEmail(newUser.email, userPayload.verificationCode);
    } catch (error) {
      logError(error);
    }

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.verificationCode;
    delete userResponse.verificationCodeExpiry;

    res.status(201).json({ success: true, user: userResponse });
  } catch (error) {
    logError(error);
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
        user.lockoutUntil = Date.now() + 15 * 60 * 1000;
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
      currentCookieConfig.maxAge = 7 * 24 * 60 * 60 * 1000;
    }

    if (user.isVerified !== true) {
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

    let finalName = sanitizedName;
    if (finalName.length < 3) finalName = (finalName + "User").slice(0, 10);
    finalName = `${finalName.slice(0, 20)}_${crypto.randomInt(1000, 9999)}`;

    let user = await User.findOne({ email });

    if (user && user.isBlocked) {
      return res.status(403).json({
        success: false,
        msg: "Your account has been blocked by an administrator.",
      });
    }

    if (!user) {
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
          isVerified: true,
          agreedToTerms: true,
        });
      } catch (createErr) {
        logError(createErr, "User.create failed in Google Login");
        if (createErr.code === 11000) {
          return res.status(409).json({
            success: false,
            msg: "A conflict occurred during account creation. Please try again.",
          });
        }
        throw createErr;
      }
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.isVerified) {
          user.isVerified = true;
          user.verificationCode = undefined;
          user.verificationCodeExpiry = undefined;
        }
        await user.save();
      }
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    await user.save();

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
      error: error.message,
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
        user.lockoutUntil = Date.now() + 15 * 60 * 1000;
        user.failedAttempts = 0;
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

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return res.status(200).json({
        success: true,
        msg: "If an account exists, a verification code has been sent.",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        msg: "If an account exists, a verification code has been sent.",
      });
    }

    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        msg: `Action restricted. Please try again in ${remainingTime} minutes.`,
      });
    }

    if (
      user.verificationCodeLastSentAt &&
      Date.now() - user.verificationCodeLastSentAt.getTime() < 60000
    ) {
      return res.status(429).json({
        success: false,
        msg: "Please wait before requesting another code.",
      });
    }

    if (
      !user.verificationResendWindowStart ||
      Date.now() - user.verificationResendWindowStart.getTime() > 3600000
    ) {
      user.verificationResendCount = 0;
      user.verificationResendWindowStart = new Date();
    }

    if (user.verificationResendCount >= 3) {
      return res.status(429).json({
        success: false,
        msg: "Too many requests. Please try again later.",
      });
    }

    user.verificationCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCodeExpiry = Date.now() + 10 * 60 * 1000;
    user.verificationCodeLastSentAt = new Date();
    user.verificationResendCount += 1;

    await user.save();

    try {
      await sendVerificationEmail(user.email, user.verificationCode);
    } catch (err) {
      logError(err);
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

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return res.status(200).json({
        success: true,
        msg: "If an account exists, a reset code has been sent.",
      });
    }

    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        msg: `Action restricted. Please try again in ${remainingTime} minutes.`,
      });
    }

    user.passwordResetCode = crypto.randomInt(100000, 999999).toString();
    user.passwordResetCodeExpiry = Date.now() + 15 * 60 * 1000;
    user.passwordResetCodeUsed = false;
    await user.save();

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
        user.lockoutUntil = Date.now() + 15 * 60 * 1000;
        user.failedPasswordResetAttempts = 0;
      }
      await user.save();
      return invalidRequest();
    }

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
