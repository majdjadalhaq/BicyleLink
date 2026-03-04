import express from "express";
import {
  /* authLimiter, */ sensitiveOpsLimiter,
} from "../middleware/rateLimiter.js";
import {
  createUser,
  loginUser,
  googleLogin,
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
  updateNotificationSettings,
} from "../controllers/user/index.js";
import { authenticate } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
// TODO: Restore `authLimiter` after testing (see CHECK_LATER.md)
userRouter.post("/login", /* authLimiter, */ loginUser);
userRouter.post("/google", /* authLimiter, */ googleLogin);
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
userRouter.patch(
  "/notification-settings",
  authenticate,
  updateNotificationSettings,
);
userRouter.get("/:id/profile", getPublicProfile);

export default userRouter;
