import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send OTP verification email
 */
export const sendOtpEmail = async (
  to: string,
  otp: string
): Promise<void> => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f0f17; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">
          TaskBoard
        </h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 8px 0 0;">
          Email Verification
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 32px 24px;">
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Use the code below to verify your email address and complete your registration.
        </p>

        <!-- OTP Code -->
        <div style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">
            Verification Code
          </p>
          <p style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
            ${otp}
          </p>
        </div>

        <p style="color: #71717a; font-size: 13px; line-height: 1.5; margin: 0;">
          This code expires in <strong style="color: #a1a1aa;">5 minutes</strong>. If you didn't request this, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
        <p style="color: #52525b; font-size: 11px; margin: 0;">
          TaskBoard — Task Management App
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"TaskBoard" <${process.env.SMTP_USER}>`,
    to,
    subject: 'TaskBoard — Verify Your Email',
    html,
  });
};

export default transporter;
