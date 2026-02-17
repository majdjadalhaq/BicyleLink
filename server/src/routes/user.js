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
} from "../controllers/user.js";

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

export default userRouter;
