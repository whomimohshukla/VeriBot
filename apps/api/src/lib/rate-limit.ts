import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "./session";

const redisStore = (prefix: string, windowMs: number) =>
  new RedisStore({
    prefix,
    sendCommand: (...args: string[]) =>
      redis.call(args[0], ...args.slice(1)) as Promise<string | number | (string | number)[]>,
  });

export const createRateLimiter = (input: {
  prefix: string;
  windowMs?: number;
  max: number;
}) => {
  const windowMs = input.windowMs ?? 60 * 1000;
  return rateLimit({
    windowMs,
    limit: input.max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: redisStore(input.prefix, windowMs),
  });
};

export const authRateLimiter = createRateLimiter({
  prefix: "ratelimit:auth",
  max: 60,
});

export const registerRateLimiter = createRateLimiter({
  prefix: "ratelimit:auth:register",
  max: 5,
});

export const loginRateLimiter = createRateLimiter({
  prefix: "ratelimit:auth:login",
  max: 10,
});

export const resetRateLimiter = createRateLimiter({
  prefix: "ratelimit:auth:reset",
  max: 5,
});

export const verificationRateLimiter = createRateLimiter({
  prefix: "ratelimit:auth:verification",
  max: 5,
});
