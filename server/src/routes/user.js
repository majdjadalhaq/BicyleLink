import express from "express";
import { authLimiter, sensitiveOpsLimiter } from "../middleware/rateLimiter.js";
import {
  createUser,
  getUsers,
  loginUser,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  getMe,
  logoutUser,
  updateProfile,
  requestSecurityCode,
  changePassword,
  deleteAccount,
  requestEmailChange,
  verifyEmailChange,
  getPublicProfile,
} from "../controllers/user.js";
import { authenticate } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.post("/", createUser);
userRouter.post("/login", authLimiter, loginUser);
userRouter.post("/verify", sensitiveOpsLimiter, verifyEmail);
userRouter.post("/resend-code", sensitiveOpsLimiter, resendVerificationCode);
userRouter.post("/request-reset", requestPasswordReset);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/me", getMe);
userRouter.post("/logout", logoutUser);

// Protected routes
userRouter.put("/profile", authenticate, updateProfile);
userRouter.post("/request-security-code", authenticate, requestSecurityCode);
userRouter.put("/password", authenticate, changePassword);
userRouter.delete("/account", authenticate, deleteAccount);
userRouter.post("/request-email-change", authenticate, requestEmailChange);
userRouter.post("/verify-email-change", authenticate, verifyEmailChange);
userRouter.get("/:id/profile", getPublicProfile);

export default userRouter;
