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
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 48px 40px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase; }
    .content { padding: 48px 40px; color: #1e293b; line-height: 1.6; }
    .footer { padding: 32px 40px; text-align: center; color: #64748b; font-size: 14px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; }
    .code-box { background-color: #f8fafc; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0; border: 2px dashed #cbd5e1; }
    .code { font-size: 42px; font-weight: 900; color: #4f46e5; letter-spacing: 0.1em; margin: 0; font-family: 'JetBrains Mono', 'Fira Code', monospace; line-height: 1; }
    .copy-tip { font-size: 13px; color: #94a3b8; margin-top: 16px; font-weight: 500; }
    .social-links { margin-top: 24px; padding-top: 24px; border-top: 1px solid #cbd5e1; }
    .social-link { color: #4f46e5; text-decoration: none; margin: 0 12px; font-weight: 600; }
    .fine-print { font-size: 12px; color: #94a3b8; margin-top: 24px; }
    p { margin-bottom: 24px; font-size: 16px; }
    h2 { font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>BiCycleL</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <div class="social-links">
          <a href="https://bicyclel.nl" class="social-link">Website</a>
          <a href="mailto:support@bicyclel.nl" class="social-link">Support</a>
        </div>
        <div class="fine-print">
          <p>&copy; 2026 BiCycleL Platform. All rights reserved.</p>
          <p>BiCycleL HQ • 123 Tech Avenue • Innovation City, IC 54321</p>
          <p>This is an automated security notification. For your protection, do not reply to this email.</p>
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
      <p class="code">${code}</p>
      <p class="copy-tip">This code will expire in 15 minutes</p>
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
      <p class="copy-tip">This code is valid for 15 minutes</p>
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
      <p class="copy-tip" style="color: #fb7185;">This code will expire in 15 minutes</p>
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
