import type { NextFunction, Request, Response } from "express";
import { prisma } from "@autonomiq/database";
import { verifyToken } from "../lib/auth";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  organization?: {
    organizationId: string;
    role: string;
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireOrgRole = (allowedRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const organizationId =
      (req.params.organizationId as string | undefined) ??
      (req.body?.organizationId as string | undefined) ??
      (req.query?.organizationId as string | undefined) ??
      (req.headers["x-organization-id"] as string | undefined);

    if (!organizationId) {
      return res.status(400).json({ message: "Organization context is required" });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      return res.status(403).json({ message: "You do not belong to this organization" });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }

    req.organization = {
      organizationId,
      role: membership.role,
    };

    return next();
  };
};
