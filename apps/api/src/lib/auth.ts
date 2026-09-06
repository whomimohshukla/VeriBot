import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

export interface RefreshTokenPayload extends AuthUser {
  sessionId: string;
  type: "refresh";
}

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const signToken = (user: AuthUser) => {
  return jwt.sign(user, env.jwtSecret, { expiresIn: "7d" });
};

export const signRefreshToken = (user: AuthUser, sessionId: string) => {
  return jwt.sign({ ...user, sessionId, type: "refresh" }, env.jwtSecret, {
    expiresIn: "30d",
  });
};

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, env.jwtSecret) as AuthUser;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const payload = jwt.verify(token, env.jwtSecret) as RefreshTokenPayload;

  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  return payload;
};

export const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};
