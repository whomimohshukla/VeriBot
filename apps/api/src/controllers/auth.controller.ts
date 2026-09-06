import type { Request, Response } from "express";
import { z } from "zod";
import {
  changePasswordSchema,
  loginSchema,
  oauthCallbackSchema,
  refreshSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../validators/schemas";
import {
  changePassword,
  loginUser,
  logoutUser,
  oauthLoginOrRegister,
  refreshUserSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "../services/auth.service";
import type { AuthenticatedRequest } from "../middleware/auth";

export const registerController = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const result = await registerUser(parsed);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    return res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const result = await loginUser(parsed);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    return res.status(401).json({ message: error instanceof Error ? error.message : "Login failed" });
  }
};

export const refreshController = async (req: Request, res: Response) => {
  try {
    const parsed = refreshSchema.parse(req.body);
    const result = await refreshUserSession(parsed);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    return res.status(401).json({ message: error instanceof Error ? error.message : "Refresh failed" });
  }
};

export const logoutController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const refreshToken = typeof req.body?.refreshToken === "string" ? req.body.refreshToken : undefined;
    const result = await logoutUser({ userId, refreshToken });
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Logout failed" });
  }
};

export const requestPasswordResetController = async (req: Request, res: Response) => {
  try {
    const parsed = requestPasswordResetSchema.parse(req.body);
    const result = await requestPasswordReset(parsed);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    return res.status(400).json({ message: error instanceof Error ? error.message : "Password reset request failed" });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(parsed);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    return res.status(400).json({ message: error instanceof Error ? error.message : "Password reset failed" });
  }
};

export const changePasswordController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = changePasswordSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = await changePassword({ userId, ...parsed });
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    return res.status(400).json({ message: error instanceof Error ? error.message : "Password change failed" });
  }
};

export const oauthController = async (req: Request, res: Response) => {
  try {
    const provider = String(req.params.provider || "").toUpperCase();
    const parsed = oauthCallbackSchema.parse(req.body);

    if (!provider || (provider !== "GOOGLE" && provider !== "GITHUB")) {
      return res.status(400).json({ message: "Unsupported OAuth provider" });
    }

    const result = await oauthLoginOrRegister({
      provider,
      providerAccountId: parsed.providerAccountId,
      email: parsed.email,
      name: parsed.name,
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    });

    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    return res.status(400).json({ message: error instanceof Error ? error.message : "OAuth login failed" });
  }
};
