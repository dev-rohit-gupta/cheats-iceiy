import nodemailer from "nodemailer";

function getGmailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const transporter = getGmailTransporter();
  const from = process.env.GMAIL_FROM || process.env.GMAIL_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your Cheats admin OTP",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 16px;">Admin Login OTP</h2>
        <p style="margin: 0 0 16px;">Use the code below to sign in to Cheats admin.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="margin: 0;">This code expires in 10 minutes.</p>
      </div>
    `,
  });
}
