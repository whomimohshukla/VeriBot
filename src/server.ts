import 'reflect-metadata';
import express from 'express';
import http from 'http';
import type { Worker } from 'bullmq';

import { env } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { setupWorkers } from './workers';
import routes from './routes';
import { logger } from './config/logger';
import { apiRateLimiter } from './middleware/rateLimiter';
import {
  corsMiddleware,
  errorHandler,
  helmetMiddleware,
  requestId,
  requestLogger,
} from './middleware';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(requestId);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(requestLogger);

app.use(apiRateLimiter);
app.use(routes);

app.use(errorHandler);

let server: http.Server | undefined;
const workers: Worker[] = [];
const startedAt = Date.now();

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'shutting down');
  if (server) {
    server.close();
  }
  await Promise.allSettled(workers.map((worker) => worker.close()));
  await disconnectDatabase();
  process.exit(0);
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

const main = async (): Promise<void> => {
  await connectDatabase();
  workers.push(...setupWorkers());
  server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        nodeEnv: env.NODE_ENV,
        pid: process.pid,
        bootMs: Date.now() - startedAt,
      },
      'VeriBot API listening'
    );
  });
};

main().catch((error) => {
  logger.fatal({ err: error }, 'failed to start server');
  process.exit(1);
});