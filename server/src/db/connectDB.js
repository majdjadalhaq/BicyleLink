import mongoose from "mongoose";

import { logInfo } from "../util/logging.js";

const connectDB = () => {
  logInfo(
    `[DEBUG] Attempting to connect to MongoDB URI: ${
      process.env.MONGODB_URL ? "DEFINED" : "UNDEFINED"
    }`,
  );
  return mongoose.connect(process.env.MONGODB_URL);
};

export default connectDB;
