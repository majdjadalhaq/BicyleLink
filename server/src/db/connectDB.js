import mongoose from "mongoose";

import { logInfo } from "../utils/logging.js";

const connectDB = () => {
  logInfo(
    `[DEBUG] Attempting to connect to MongoDB URI: ${
      process.env.MONGODB_URL ? "DEFINED" : "UNDEFINED"
    }`,
  );
  mongoose.set("strictQuery", true);
  return mongoose.connect(process.env.MONGODB_URL);
};

export default connectDB;
