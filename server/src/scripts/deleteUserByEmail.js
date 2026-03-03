/* eslint-disable no-console */
import dotenv from "dotenv";
import connectDB from "../db/connectDB.js";
import User from "../models/User.js";

dotenv.config();

const email = process.argv[2] || "majdhamde1901@gmail.com";

async function main() {
  await connectDB();
  const result = await User.deleteOne({ email });
  if (result.deletedCount) {
    console.log(`Deleted user: ${email}`);
  } else {
    console.log(`No user found with email: ${email}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
