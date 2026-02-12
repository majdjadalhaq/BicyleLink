import express from "express";
import {
  createUser,
  getUsers,
  loginUser,
  verifyEmail,
} from "../controllers/user.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/verify", verifyEmail);

export default userRouter;
