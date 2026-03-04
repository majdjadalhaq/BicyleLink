import express from "express";
import { logInfo } from "../utils/logging.js";
const router = express.Router();

/**
 * Endpoint to handle incoming webhooks from Resend
 * This allows us to "Receive" events about our emails (delivered, opened, etc.)
 */
router.post("/webhook", (req, res) => {
  const event = req.body;

  // You can log these to see if your emails are actually being delivered
  logInfo(`📨 Email Event Received: ${event.type}`);

  // Future: Here you can update your database if an email was opened or if a user replied
  res.status(200).json({ received: true });
});

/**
 * General purpose API to manually trigger a test email (Admin only recommended)
 */
router.get("/test", async (req, res) => {
  try {
    const { sendVerificationEmail } = await import("../utils/emailService.js");
    // Change this to your email to test
    await sendVerificationEmail(
      process.env.TEST_EMAIL || "test@example.com",
      "123456",
    );
    res.json({ success: true, message: "Test email triggered" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
