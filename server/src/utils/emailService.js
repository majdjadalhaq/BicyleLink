import { Resend } from "resend";
import nodemailer from "nodemailer";
import { logError, logInfo } from "./logging.js";

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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f0fdf4; padding-bottom: 40px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; margin-top: 40px; box-shadow: 0 10px 30px -5px rgba(16, 183, 127, 0.15); border: 1px solid #d1fae5; }
    .header { background: linear-gradient(135deg, #10B77F 0%, #059669 100%); padding: 40px 40px 36px; text-align: center; color: #ffffff; }
    .header-icon { font-size: 36px; margin-bottom: 12px; display: block; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.03em; text-transform: uppercase; }
    .header-sub { margin: 6px 0 0; font-size: 13px; font-weight: 500; opacity: 0.85; letter-spacing: 0.05em; }
    .content { padding: 48px 40px; color: #1e293b; line-height: 1.7; }
    .footer { padding: 28px 40px; text-align: center; color: #64748b; font-size: 13px; background-color: #f8fffe; border-top: 1px solid #d1fae5; }
    .code-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0; border: 2px solid #6ee7b7; cursor: pointer; }
    .code { font-size: 46px; font-weight: 900; color: #059669; letter-spacing: 0.2em; margin: 0; font-family: 'Courier New', Courier, monospace; line-height: 1; user-select: all; -webkit-user-select: all; }
    .copy-tip { font-size: 12px; color: #6b7280; margin-top: 14px; font-weight: 500; }
    .copy-btn { display: inline-block; margin-top: 16px; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 999px; letter-spacing: 0.05em; }
    .social-links { margin-top: 20px; padding-top: 20px; border-top: 1px solid #d1fae5; }
    .social-link { color: #10B77F; text-decoration: none; margin: 0 12px; font-weight: 700; }
    .fine-print { font-size: 12px; color: #9ca3af; margin-top: 16px; }
    p { margin-bottom: 20px; font-size: 16px; }
    h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="header-icon">🚲</span>
        <h1>BiCycleL</h1>
        <p class="header-sub">The pre-loved bicycle marketplace</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <div class="social-links">
          <a href="https://bicyclel.nl" class="social-link">Visit BiCycleL</a>
          <a href="mailto:hello@bicyclel.nl" class="social-link">Contact Support</a>
        </div>
        <div class="fine-print">
          <p>&copy; 2026 BiCycleL. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
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
    <h2>Welcome to BiCycleL!</h2>
    <p>We're thrilled to have you join our community of cycling enthusiasts. To get started, please verify your email address by entering the code below:</p>
    <div class="code-box">
      <p class="code" id="code">${code}</p>
      <p class="copy-tip">Tap the code above to select it &bull; Expires in 15 minutes</p>
    </div>
    <p>If you didn't create an account with us, you can safely ignore this email.</p>
    <p>Happy cycling,<br>The BiCycleL Team</p>
  `;
  await sendMail(
    {
      to: email,
      subject: "Welcome to BiCycleL! Verify your email",
      html: emailTemplate(content, "Verify Email"),
      text: `Welcome to BiCycleL! Use this code to verify your email: ${code}`,
    },
    "Verification",
  );
};

export const sendPasswordResetEmail = async (email, code) => {
  const content = `
    <h2>Reset your password</h2>
    <p>We received a request to reset your password for your BiCycleL account. Use the secure code below to proceed:</p>
    <div class="code-box">
      <p class="code">${code}</p>
      <p class="copy-tip">Tap the code above to select it &bull; Valid for 15 minutes</p>
    </div>
    <p>If you didn't request a password reset, please ensure your account security or contact our support team.</p>
    <p>Stay secure,<br>The BiCycleL Security Team</p>
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
    <h2 style="color: #e11d48;">Security Alert</h2>
    <p>A sensitive action was requested on your BiCycleL account. For your protection, please verify this action using the following security code:</p>
    <div class="code-box" style="background-color: #fff1f2; border-color: #fecdd3; border-style: solid;">
      <p class="code" style="color: #e11d48;">${code}</p>
      <p class="copy-tip" style="color: #fb7185;">Tap the code above to select it &bull; Expires in 15 minutes</p>
    </div>
    <p style="font-weight: 600;">If you did not request this, please change your password immediately and secure your account.</p>
    <p>Sincerely,<br>The BiCycleL Security Team</p>
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
