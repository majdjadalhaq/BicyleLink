import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../../models/User.js";
import { cookieConfig } from "../../config/jwt.js";
import { sendSecurityCodeEmail } from "../../utils/emailService.js";
import { logError } from "../../utils/logging.js";

export const requestSecurityCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    user.securityCode = crypto.randomInt(100000, 999999).toString();
    user.securityCodeExpiry = Date.now() + 15 * 60 * 1000;
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

    if (!user.notificationSettings) {
      user.notificationSettings = {};
    }

    Object.keys(settings).forEach((key) => {
      user.notificationSettings[key] = settings[key];
    });

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
