import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Email configuration for Mailtrap SMTP
export const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "2525"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Validate email configuration on startup
if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
  throw new Error(
    "Email configuration incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env",
  );
}
