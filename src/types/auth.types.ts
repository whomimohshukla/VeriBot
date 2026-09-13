import type { MembershipRole } from '@prisma/client';

export type RoleName = MembershipRole;

export interface JwtPayload {
  sub: string;
  orgId: string;
  roles: RoleName[];
  type: 'access' | 'refresh';
  jti?: string;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  orgId: string;
  roles: RoleName[];
  permissions: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: Date;
}

export interface AccessTokenResult {
  token: string;
  expiresInSeconds: number;
}
