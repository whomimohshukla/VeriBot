import cors from 'cors';
import { env } from '../config/environment';

const parseOrigins = (): string[] | true => {
  if (env.CORS_ORIGINS === '*') return true;
  return env.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const corsMiddleware = cors({
  origin: parseOrigins(),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Org-Id', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400,
});
