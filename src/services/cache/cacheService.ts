import { getRedis } from '../../config/redis';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

const CACHE_TTL = 60 * 5;

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedis();
      const value = await redis.get(`cache:${key}`);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = CACHE_TTL): Promise<void> {
    try {
      const redis = getRedis();
      await redis.set(`cache:${key}`, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      logger.warn({ key, err: error }, 'cache set failed');
    }
  },

  async del(key: string): Promise<void> {
    try {
      const redis = getRedis();
      await redis.del(`cache:${key}`);
    } catch {
      return;
    }
  },

  async delByPattern(pattern: string): Promise<void> {
    try {
      const redis = getRedis();
      const keys = await redis.keys(`cache:${pattern}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      return;
    }
  },

  async remember<T>(key: string, loader: () => Promise<T>, ttlSeconds = CACHE_TTL): Promise<T> {
    const cached = await cacheService.get<T>(key);
    if (cached !== null) return cached;
    const value = await loader();
    await cacheService.set(key, value, ttlSeconds);
    return value;
  },

  async flushOrganization(organizationId: string): Promise<void> {
    await cacheService.delByPattern(`org:${organizationId}`);
  },
};

export const getDb = () => prisma;
