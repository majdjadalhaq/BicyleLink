import express from "express";
import { logInfo, logError } from "../utils/logging.js";
import { authorizeAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * Endpoint to handle incoming webhooks from Resend.
 * Validates the webhook signature to prevent spoofing.
 * Resend signs each webhook with a shared secret — set RESEND_WEBHOOK_SECRET in Heroku.
 */
router.post("/webhook", (req, res) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  // If a webhook secret is configured, validate the signature
  if (secret) {
    const signature =
      req.headers["svix-signature"] || req.headers["resend-signature"];
    if (!signature || signature !== secret) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid webhook signature" });
    }
  }

  const event = req.body;
  logInfo(`Email webhook received: ${event?.type || "unknown"}`);

  // Future: handle delivery/open/bounce events and update DB
  res.status(200).json({ success: true, msg: "Webhook received" });
});

/**
 * Admin-only endpoint to manually trigger a test email.
 * POST to avoid accidental triggering by crawlers or browser pre-fetch.
 * Requires admin authentication.
 */
router.post("/test", authorizeAdmin, async (req, res) => {
  try {
    const { sendVerificationEmail } = await import("../utils/emailService.js");
    const target =
      process.env.TEST_EMAIL || req.user?.email || "test@example.com";
    await sendVerificationEmail(target, "123456");
    res.json({ success: true, msg: `Test email sent to ${target}` });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: error.message });
  }
});

export default router;
