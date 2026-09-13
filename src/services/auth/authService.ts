import { signToken, verifyToken } from '../../utils/jwt';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { userRepository } from '../../repositories/user.repository';
import { organizationRepository } from '../../repositories/organization.repository';
import { ROLE_PERMISSIONS } from '../../constants/roles';
import { passwordService } from './passwordService';
import { tokenService } from './tokenService';
import { toSlug } from '../../utils/helpers';
import { env } from '../../config/environment';
import type { MembershipRole } from '@prisma/client';
import type { TokenPair, AuthUser, PublicUser, JwtPayload } from '../../types/auth.types';

export interface RegisterParams {
  email: string;
  password: string;
  name?: string;
  organizationName?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResult {
  user: PublicUser;
  organization: { id: string; name: string; slug: string };
  tokens: TokenPair;
}

const toPublicUser = (user: {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  emailVerified: Date | null;
  createdAt: Date;
}): PublicUser => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    emailVerified: user.emailVerified !== null,
    createdAt: user.createdAt,
  };
};

export const authService = {
  async register(params: RegisterParams, ipAddress?: string): Promise<AuthResult> {
    const existing = await userRepository.findActiveByEmail(params.email);
    if (existing) {
      throw new ConflictError(Messages.AUTH.EMAIL_IN_USE);
    }

    const passwordHash = await passwordService.hash(params.password);
    const user = await userRepository.create({
      email: params.email,
      name: params.name,
      passwordHash,
    });

    const orgName = params.organizationName ?? `${params.name ?? 'My'} Workspace`;
    let slug = toSlug(orgName);
    if (!slug) {
      slug = `org-${user.id.slice(0, 8)}`;
    }
    let uniqueSlug = slug;
    for (let i = 1; i < 10; i++) {
      const existingOrg = await organizationRepository.findBySlug(uniqueSlug);
      if (!existingOrg) break;
      uniqueSlug = `${slug}-${i}`;
    }

    const organization = await organizationRepository.create({
      name: orgName,
      slug: uniqueSlug,
    });

    await organizationRepository.addMember({
      organizationId: organization.id,
      userId: user.id,
      role: 'OWNER',
    });

    const { billingService } = await import('../billing/billingService');
    await billingService.getOrCreate(organization.id);

    const verificationToken = signToken(
      { sub: user.id, orgId: organization.id, roles: ['OWNER'], type: 'access' },
      'access'
    );
    await sendVerificationEmail(user.email, verificationToken, ipAddress);

    const tokens = await tokenService.issue({
      userId: user.id,
      orgId: organization.id,
      roles: ['OWNER'],
    });

    return {
      user: toPublicUser(user),
      organization: { id: organization.id, name: organization.name, slug: organization.slug },
      tokens,
    };
  },

  async login(params: LoginParams): Promise<AuthResult> {
    const user = await userRepository.findActiveByEmail(params.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const valid = await passwordService.verify(params.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const membership = await organizationRepository.findMembershipByUser(user.id);
    if (!membership) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const org = await organizationRepository.findById(membership.organizationId);
    if (!org) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const permissionRoles: MembershipRole[] = [membership.role];
    const roles = permissionRoles;

    const tokens = await tokenService.issue({
      userId: user.id,
      orgId: org.id,
      roles,
    });

    return {
      user: toPublicUser(user),
      organization: { id: org.id, name: org.name, slug: org.slug },
      tokens,
    };
  },

  async logout(accessToken: string | undefined, refreshToken?: string): Promise<void> {
    if (accessToken) {
      await tokenService.blacklistAccess(accessToken);
    }
    if (refreshToken) {
      await tokenService.revokeRefresh(refreshToken);
    }
  },

  async refreshTokens(refreshToken: string): Promise<{ user: PublicUser; tokens: TokenPair }> {
    const { tokens } = await tokenService.refresh(refreshToken);
    const payload = verifyToken(tokens.accessToken, 'access');
    const user = await userRepository.findActiveById(payload.sub);
    if (!user) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
    }
    return { user: toPublicUser(user), tokens };
  },

  async verifyEmail(token: string): Promise<void> {
    const payload = verifyToken(token, 'access');
    const user = await userRepository.findActiveById(payload.sub);
    if (!user) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
    }
    if (user.emailVerified) {
      throw new ConflictError(Messages.AUTH.EMAIL_ALREADY_VERIFIED);
    }
    await userRepository.update(user.id, { emailVerified: new Date() });
  },

  async resendVerification(email: string): Promise<void> {
    const user = await userRepository.findActiveByEmail(email);
    if (!user) {
      return;
    }
    if (user.emailVerified) {
      throw new ConflictError(Messages.AUTH.EMAIL_ALREADY_VERIFIED);
    }
    const token = signToken({ sub: user.id, type: 'verification' } as unknown as JwtPayload, 'access');
    await sendVerificationEmail(user.email, token);
  },

  async buildAuthUser(userId: string, orgId: string): Promise<AuthUser> {
    const user = await userRepository.findActiveById(userId);
    if (!user) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
    }
    const membership = await organizationRepository.findMembership(orgId, userId);
    if (!membership) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
    }
    const roles = [membership.role];
    const permissions = Array.from(new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? [])));
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      orgId,
      roles,
      permissions,
    };
  },
};

const sendVerificationEmail = async (email: string, token: string, ipAddress?: string): Promise<void> => {
  const url = `${env.APP_ORIGIN}/verify-email?token=${token}`;
  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
    console.log(`[email:dev] verification link for ${email}: ${url}`);
  }
  void ipAddress;
};
