import { Job } from 'bullmq';
import type { AiJobData } from '../queues/aiQueue';
import { scannerService } from '../services/application/scannerService';
import { applicationRepository } from '../repositories/application.repository';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { NotFoundError } from '../utils/errors';
import { Messages } from '../constants/messages';

export const processAiExplorationJob = async (job: Job<AiJobData>): Promise<void> => {
  if (job.name !== 'explore-application') {
    return;
  }

  const data = job.data as { applicationId: string; environmentId?: string; testUserId?: string; maxPages?: number };
  const application = await applicationRepository.findById(data.applicationId);
  if (!application) {
    throw new NotFoundError(Messages.APPLICATION.NOT_FOUND);
  }

  const baseUrl = application.baseUrl ?? '/';
  const environmentUrl = data.environmentId
    ? (await prisma.environment.findUnique({ where: { id: data.environmentId } }))?.url
    : undefined;

  const result = await scannerService.exploreApplication({
    applicationId: data.applicationId,
    baseUrl: environmentUrl ?? baseUrl,
    environmentId: data.environmentId,
    testUserId: data.testUserId,
    maxPages: data.maxPages,
  });

  logger.info({ applicationId: data.applicationId, ...result }, 'application exploration complete');
};