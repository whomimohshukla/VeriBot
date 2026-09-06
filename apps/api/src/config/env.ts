import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  cookieSecret: process.env.COOKIE_SECRET ?? process.env.JWT_SECRET ?? "dev-cookie-secret",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
  emailVerificationUrl: process.env.EMAIL_VERIFICATION_URL ?? "http://localhost:3000/verify-email",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPassword: process.env.SMTP_PASSWORD ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "AutonomIQ <no-reply@localhost>",
};
