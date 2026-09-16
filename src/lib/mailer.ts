import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
  console.warn(
    "SMTP configuration is incomplete. Check SMTP_HOST, SMTP_USER, SMTP_PASSWORD and SMTP_FROM."
  );
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

/**
 * Send email verification code
 */
export async function sendVerificationEmail(
  email: string,
  code: string
) {
  const verificationUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/auth/verify-email`;

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: "Verify your Kometik email",
    text: `Your Kometik verification code is: ${code}

This code expires in 10 minutes.

You can verify your email here:
${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="margin-bottom: 20px;">Verify your Kometik account</h2>

        <p>Your verification code is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 20px;
          text-align: center;
          background: #f5f5f5;
          border-radius: 12px;
          margin: 20px 0;
        ">
          ${code}
        </div>

        <p>This code expires in <strong>10 minutes</strong>.</p>

        <p>
          <a
            href="${verificationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111;
              color: white;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Verify Email
          </a>
        </p>

        <p style="color: #777; font-size: 13px;">
          If you did not create a Kometik account, you can ignore this email.
        </p>
      </div>
    `,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: "Reset your Kometik password",
    text: `We received a request to reset your Kometik password.

Reset your password using this link:
${resetUrl}

This link expires in 30 minutes.

If you did not request a password reset, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="margin-bottom: 20px;">Reset your Kometik password</h2>

        <p>
          We received a request to reset your Kometik password.
        </p>

        <p style="margin: 30px 0;">
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 14px 24px;
              background: #111;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link expires in <strong>30 minutes</strong>.
        </p>

        <p style="color: #777; font-size: 13px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

/**
 * Test SMTP connection
 */
export async function verifyMailerConnection() {
  await transporter.verify();
}
