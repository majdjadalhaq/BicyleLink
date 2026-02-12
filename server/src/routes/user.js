import express from "express";
import {
  createUser,
  getUsers,
  loginUser,
  verifyEmail,
  resendVerificationCode,
} from "../controllers/user.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/verify", verifyEmail);
userRouter.post("/resend-code", resendVerificationCode);

export default userRouter;
