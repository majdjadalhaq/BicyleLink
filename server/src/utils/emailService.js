import nodemailer from "nodemailer";
import { logError, logInfo } from "../util/logging.js";

/**
 * Get the current email configuration from environment variables
 * @returns {Object} The nodemailer transport configuration
 */
const getEmailConfig = () => ({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: parseInt(process.env.MAILTRAP_PORT || "2525"),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

/**
 * Base function to send an email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email text content
 * @param {string} options.code - The code for fallback logging
 * @param {string} type - Descriptive type for fallback (Verification/Reset)
 */
const sendMail = async ({ to, subject, html, text, code }, type) => {
  try {
    const transporter = nodemailer.createTransport(getEmailConfig());
    const senderEmail =
      process.env.MAILTRAP_SENDER_EMAIL || "noreply@bicyclel.com";
    const senderName = process.env.MAILTRAP_SENDER_NAME || "BiCycleL";

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject,
      html,
      text,
    };

    // Manual timeout wrapper to guarantee fail-fast behavior
    const sendMailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email sending timed out")), 10000),
    );

    await Promise.race([sendMailPromise, timeoutPromise]);
    logInfo(`${type} email sent to ${to} via Mailtrap Sandbox`);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`DEV FALLBACK -> ${type} Email failed:`, error.message);
      console.log("Recipient:", to);
      console.log(`${type} Code:`, code);
    } else {
      logError(error);
      throw error;
    }
  }
};

/**
 * Send a verification email to the user
 * @param {string} email - The user's email address
 * @param {string} code - The verification code
 */
export const sendVerificationEmail = async (email, code) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <h1 style="color: #4F46E5; letter-spacing: 5px;">${code}</h1>
      <p>This code will expire in 15 minutes.</p>
    </div>
  `;
  const text = `Your verification code is: ${code}. This code will expire in 15 minutes.`;

  await sendMail(
    { to: email, subject: "Verify your email", html, text, code },
    "Verification",
  );
};

/**
 * Send a password reset email to the user
 * @param {string} email - The user's email address
 * @param {string} code - The reset code
 */
export const sendPasswordResetEmail = async (email, code) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>Your password reset code is:</p>
      <h1 style="color: #4F46E5; letter-spacing: 5px;">${code}</h1>
      <p>This code will expire in 15 minutes.</p>
    </div>
  `;
  const text = `Your password reset code is: ${code}. This code will expire in 15 minutes.`;

  await sendMail(
    { to: email, subject: "Reset your password", html, text, code },
    "Reset",
  );
};
