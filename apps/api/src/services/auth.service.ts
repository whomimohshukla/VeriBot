import { prisma } from "@autonomiq/database";
import { comparePassword, generateSecureToken, hashPassword, hashToken, signRefreshToken, signToken } from "../lib/auth";
import { verifyRefreshToken } from "../lib/auth";

const sanitizeUser = (user: { id: string; name: string; email: string; emailVerified: boolean }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
});

const createSessionForUser = async (userId: string, refreshToken: string) => {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt,
    },
  });
};

export const registerUser = async (input: { name: string; email: string; password: string }) => {
  const email = input.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const sessionId = generateSecureToken(16);
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, name: user.name }, sessionId);
  await createSessionForUser(user.id, refreshToken);

  const token = signToken({ userId: user.id, email: user.email, name: user.name });

  return {
    user: sanitizeUser(user),
    token,
    refreshToken,
  };
};

export const loginUser = async (input: { email: string; password: string }) => {
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    throw new Error("Invalid credentials");
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const sessionId = generateSecureToken(16);
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, name: user.name }, sessionId);
  await createSessionForUser(user.id, refreshToken);

  const token = signToken({ userId: user.id, email: user.email, name: user.name });

  return {
    user: sanitizeUser(user),
    token,
    refreshToken,
  };
};

export const refreshUserSession = async (input: { refreshToken: string }) => {
  const payload = verifyRefreshToken(input.refreshToken);
  const tokenHash = hashToken(input.refreshToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  if (session.userId !== payload.userId) {
    throw new Error("Session user mismatch");
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsed: new Date() },
  });

  const token = signToken({ userId: session.user.id, email: session.user.email, name: session.user.name });

  return {
    user: sanitizeUser(session.user),
    token,
    refreshToken: input.refreshToken,
  };
};

export const logoutUser = async (input: { userId: string; refreshToken?: string }) => {
  if (input.refreshToken) {
    const payload = verifyRefreshToken(input.refreshToken);

    if (payload.userId !== input.userId) {
      throw new Error("Token does not match the current user");
    }

    await prisma.session.deleteMany({
      where: {
        userId: input.userId,
        tokenHash: hashToken(input.refreshToken),
      },
    });
  }

  await prisma.session.deleteMany({
    where: { userId: input.userId },
  });

  return { message: "Logged out successfully" };
};

export const requestPasswordReset = async (input: { email: string }) => {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { message: "If an account exists for this email, a reset link was created." };
  }

  const token = generateSecureToken(24);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    message: "If an account exists for this email, a reset link was created.",
    resetToken: token,
  };
};

export const resetPassword = async (input: { token: string; password: string }) => {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: input.token },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new Error("Invalid or expired reset token");
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return { message: "Password reset successful" };
};

export const changePassword = async (input: { userId: string; currentPassword: string; newPassword: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    throw new Error("Password management is unavailable for this account");
  }

  const isValid = await comparePassword(input.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: input.userId },
      data: { passwordHash },
    }),
    prisma.session.deleteMany({
      where: { userId: input.userId },
    }),
  ]);

  return { message: "Password changed successfully" };
};

export const oauthLoginOrRegister = async (input: {
  provider: "GOOGLE" | "GITHUB";
  providerAccountId: string;
  email?: string;
  name?: string;
  accessToken?: string;
  refreshToken?: string;
}) => {
  const normalizedEmail = input.email?.toLowerCase();

  const existingAccount = await prisma.oauthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    },
    include: { user: true },
  });

  let user = existingAccount?.user;

  if (!user) {
    if (!normalizedEmail) {
      throw new Error("Email is required to continue with social login");
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      user = existingUser;
    } else {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: input.name ?? normalizedEmail.split("@")[0],
          emailVerified: true,
          oauthAccounts: {
            create: {
              provider: input.provider,
              providerAccountId: input.providerAccountId,
              email: normalizedEmail,
              name: input.name,
              accessToken: input.accessToken,
              refreshToken: input.refreshToken,
            },
          },
        },
      });
    }

    if (!existingAccount) {
      await prisma.oauthAccount.create({
        data: {
          provider: input.provider,
          providerAccountId: input.providerAccountId,
          email: normalizedEmail,
          name: input.name,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          userId: user.id,
        },
      });
    }
  }

  const sessionId = generateSecureToken(16);
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, name: user.name }, sessionId);
  await createSessionForUser(user.id, refreshToken);

  const token = signToken({ userId: user.id, email: user.email, name: user.name });

  return {
    user: sanitizeUser(user),
    token,
    refreshToken,
  };
};
