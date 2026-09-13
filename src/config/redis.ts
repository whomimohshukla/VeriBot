import Redis from 'ioredis';
import { env } from './environment';

interface ParsedRedisUrl {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export const parseRedisUrl = (url: string): ParsedRedisUrl => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    db: Number(parsed.pathname?.replace('/', '') || 0),
  };
};

let redisClient: Redis | null = null;

export const getRedis = (): Redis => {
  if (!redisClient) {
    const opts = parseRedisUrl(env.REDIS_URL);
    redisClient = new Redis({
      ...opts,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      keyPrefix: env.REDIS_KEY_PREFIX,
    });
    redisClient.on('error', (err) => {
      console.error('[redis] connection error', err.message);
    });
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};