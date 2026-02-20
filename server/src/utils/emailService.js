import { Resend } from "resend";
import nodemailer from "nodemailer";
import { logError, logInfo } from "../util/logging.js";

/**
 * Creates and returns an Ethereal transporter for local development.
 */
let etherealTransporter = null;
const getEtherealTransporter = async () => {
  if (etherealTransporter) return etherealTransporter;

  const testAccount = await nodemailer.createTestAccount();
  etherealTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return etherealTransporter;
};

/**
 * Common HTML Wrapper for all emails to ensure a consistent, premium look.
 */
const emailTemplate = (content, _title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 40px; color: #374151; line-height: 1.6; }
    .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 13px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; }
    .code-box { background-color: #f3f4f6; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0; border: 2px solid #e5e7eb; cursor: pointer; }
    .code { font-size: 36px; font-weight: 800; color: #4F46E5; letter-spacing: 10px; margin: 0; font-family: monospace; }
    .copy-tip { font-size: 12px; color: #6b7280; margin-top: 10px; font-weight: 500; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body class="body">
  <div class="container">
    <div class="header">
      <h1>BiCycleL</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; 2026 BiCycleL. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Base function to send an email. Routes to Resend in production and Ethereal in development.
 */
const sendMail = async ({ to, subject, html, text }, type) => {
  try {
    const senderEmail =
      process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev";
    const senderName = process.env.RESEND_SENDER_NAME || "BiCycleL";
    const from = `${senderName} <${senderEmail}>`;

    if (
      process.env.NODE_ENV === "production" ||
      process.env.USE_RESEND === "true"
    ) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey || apiKey === "re_dummy_key") {
        throw new Error("Missing required env var: RESEND_API_KEY");
      }

      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject,
        html,
        text,
      });

      if (error) throw new Error(error.message);
      logInfo(`${type} email sent to ${to} via Resend. ID: ${data?.id}`);
      return;
    }

    const tx = await getEtherealTransporter();
    const info = await tx.sendMail({ from, to, subject, text, html });

    logInfo(`${type} email sent locally via Ethereal`);
    logInfo("=======================================");
    logInfo(
      `✉️ View Local Email Preview: ${nodemailer.getTestMessageUrl(info)}`,
    );
    logInfo("=======================================");
  } catch (error) {
    logError(error);
  }
};

export const sendVerificationEmail = async (email, code) => {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">Verify your email</h2>
    <p>Thank you for joining BiCycleL! Please use the verification code below to complete your registration:</p>
    <div class="code-box">
      <p class="code">${code}</p>
      <p class="copy-tip">Tip: Double-click to select and copy code</p>
    </div>
    <p>This code is valid for 15 minutes. If you did not create an account, you can safely ignore this email.</p>
  `;
  await sendMail(
    {
      to: email,
      subject: "Verify your email - BiCycleL",
      html: emailTemplate(content, "Verify Email"),
      text: `Your BiCycleL verification code is: ${code}`,
    },
    "Verification",
  );
};

export const sendPasswordResetEmail = async (email, code) => {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">Reset your password</h2>
    <p>We received a request to reset your password. Use the code below to set a new one:</p>
    <div class="code-box">
      <p class="code">${code}</p>
      <p class="copy-tip">Tip: Double-click to select and copy code</p>
    </div>
    <p>This code is valid for 15 minutes. If you didn't request a password reset, your account is still secure.</p>
  `;
  await sendMail(
    {
      to: email,
      subject: "Reset your password - BiCycleL",
      html: emailTemplate(content, "Reset Password"),
      text: `Your BiCycleL password reset code is: ${code}`,
    },
    "Reset",
  );
};

export const sendSecurityCodeEmail = async (email, code) => {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">Security Code</h2>
    <p>A sensitive action was requested on your BiCycleL account. Please use the following official security code:</p>
    <div class="code-box" style="background-color: #fff1f2; border-color: #fecdd3;">
      <p class="code" style="color: #e11d48;">${code}</p>
      <p class="copy-tip">Tip: Double-click to select and copy code</p>
    </div>
    <p>This code expires in 15 minutes. <strong>If you did not request this, please change your password immediately.</strong></p>
  `;
  await sendMail(
    {
      to: email,
      subject: "Action Required: Your Security Code - BiCycleL",
      html: emailTemplate(content, "Security Code"),
      text: `Your BiCycleL security code is: ${code}`,
    },
    "Security Code",
  );
};
