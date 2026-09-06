import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = env.smtpHost
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPassword } : undefined,
    })
  : null;

export const sendVerificationEmail = async (input: {
  email: string;
  firstName: string;
  token: string;
  code: string;
}) => {
  const verificationUrl = `${env.emailVerificationUrl}?token=${encodeURIComponent(input.token)}`;
  const message = {
    from: env.emailFrom,
    to: input.email,
    subject: "Verify your AutonomIQ email",
    text: `Hi ${input.firstName}, verify your email with this code: ${input.code}\n\nOr open: ${verificationUrl}`,
    html: `<p>Hi ${input.firstName},</p><p>Your AutonomIQ verification code is <strong>${input.code}</strong>.</p><p><a href="${verificationUrl}">Verify email</a></p>`,
  };

  if (!transporter) {
    if (env.nodeEnv !== "production") {
      console.warn(`[email:development] Verification email queued for ${input.email}; code is ${input.code}`);
      return;
    }
    throw new Error("Email delivery is not configured");
  }

  await transporter.sendMail(message);
};
