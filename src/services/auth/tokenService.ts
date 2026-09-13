import { randomUUID, randomBytes, createHash } from 'crypto';
import { signToken, verifyToken } from '../../utils/jwt';
import { getRedis } from '../../config/redis';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import type { JwtPayload, TokenPair } from '../../types/auth.types';
import type { RoleName } from '../../constants/roles';

const REFRESH_PREFIX = 'auth:refresh:';
const USER_TOKENS_PREFIX = 'auth:user-tokens:';
const BLACKLIST_PREFIX = 'auth:blacklist:';

const toNumber = (value: unknown): number => {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : 0;
};

const remainingTtl = (exp?: number): number => {
  if (!exp || !Number.isFinite(exp)) return 15 * 60;
  return Math.max(60, exp - Math.floor(Date.now() / 1000));
};

const recordUserToken = async (userId: string, jti: string, ttl: number): Promise<void> => {
  const redis = getRedis();
  await redis.sadd(`${USER_TOKENS_PREFIX}${userId}`, jti);
  await redis.expire(`${USER_TOKENS_PREFIX}${userId}`, ttl);
};

const forgetUserToken = async (userId: string, jti: string): Promise<void> => {
  const redis = getRedis();
  await redis.srem(`${USER_TOKENS_PREFIX}${userId}`, jti);
};

export interface IssueOptions {
  userId: string;
  orgId: string;
  roles: RoleName[];
}

export interface RefreshResult {
  tokens: TokenPair;
}

export const tokenService = {
  issue: async (options: IssueOptions): Promise<TokenPair> => {
    const jti = randomUUID();
    const basePayload: JwtPayload = {
      sub: options.userId,
      orgId: options.orgId,
      roles: options.roles,
      type: 'access',
      jti,
    };
    const accessToken = signToken(basePayload, 'access');

    const refreshPayload: JwtPayload = {
      ...basePayload,
      type: 'refresh',
      jti,
    };
    const refreshToken = signToken(refreshPayload, 'refresh');

    const redis = getRedis();
    const expiresInSeconds = 7 * 24 * 60 * 60;
    await redis.set(`${REFRESH_PREFIX}${jti}`, JSON.stringify({ userId: options.userId, orgId: options.orgId }), 'EX', expiresInSeconds);
    await recordUserToken(options.userId, jti, expiresInSeconds);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
      tokenType: 'Bearer',
    };
  },

  refresh: async (refreshToken: string): Promise<RefreshResult> => {
    let payload: JwtPayload;
    try {
      payload = verifyToken(refreshToken, 'refresh');
    } catch {
      throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
    }

    if (payload.type !== 'refresh' || !payload.jti) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
    }

    const redis = getRedis();
    const stored = await redis.get(`${REFRESH_PREFIX}${payload.jti}`);
    if (!stored) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
    }

    const data = JSON.parse(stored) as { userId: string; orgId: string };
    if (data.userId !== payload.sub) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
    }

    await redis.del(`${REFRESH_PREFIX}${payload.jti}`);
    await forgetUserToken(data.userId, payload.jti);
    const tokens = await tokenService.issue({
      userId: data.userId,
      orgId: data.orgId,
      roles: payload.roles,
    });

    return { tokens };
  },

  revokeRefresh: async (refreshToken: string): Promise<void> => {
    try {
      const payload = verifyToken(refreshToken, 'refresh');
      if (payload.jti) {
        const redis = getRedis();
        await redis.del(`${REFRESH_PREFIX}${payload.jti}`);
        await forgetUserToken(String(payload.sub ?? ''), payload.jti);
      }
    } catch {
      return;
    }
  },

  revokeAllForUser: async (userId: string): Promise<void> => {
    const redis = getRedis();
    const jtis = await redis.smembers(`${USER_TOKENS_PREFIX}${userId}`);
    const pipeline = redis.pipeline();
    for (const jti of jtis) {
      pipeline.del(`${REFRESH_PREFIX}${jti}`);
    }
    pipeline.del(`${USER_TOKENS_PREFIX}${userId}`);
    await pipeline.exec();
  },

  blacklistAccess: async (accessToken: string): Promise<void> => {
    try {
      const payload = verifyToken(accessToken, 'access');
      if (payload.jti) {
        const redis = getRedis();
        await redis.set(`${BLACKLIST_PREFIX}${payload.jti}`, '1', 'EX', remainingTtl(toNumber(payload.exp)));
      }
    } catch {
      return;
    }
  },

  generateApiKey: (): string => {
    const entropy = randomBytes(24);
    return `vrb_${entropy.toString('base64url')}`;
  },

  hashApiKey: async (apiKey: string): Promise<string> => {
    return createHash('sha256').update(apiKey).digest('hex');
  },
};