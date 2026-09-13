import { Job } from 'bullmq';
import type { AiJobData } from '../queues/aiQueue';
import { failureAnalyzerAgent } from '../services/ai/failureAnalyzerAgent';
import { bugDetectionService } from '../services/bug/bugDetectionService';
import { testResultRepository } from '../repositories/testResult.repository';
import { logger } from '../config/logger';
import type { Prisma } from '@prisma/client';

export const processFailureAnalysisJob = async (job: Job<AiJobData>): Promise<void> => {
  if (job.name !== 'analyze-failure') {
    return;
  }

  const data = job.data as {
    testResultId: string;
    organizationId: string;
    testRunId: string;
    projectId?: string;
  };
  const result = await testResultRepository.findById(data.testResultId);
  if (!result) {
    logger.warn({ testResultId: data.testResultId }, 'no test result found for failure analysis');
    return;
  }

  const response = await failureAnalyzerAgent.execute(
    {
      organizationId: data.organizationId,
      testRunId: data.testRunId,
      testResultId: data.testResultId,
    },
    {
      errorMessage: result.errorMessage ?? undefined,
      consoleLog: result.consoleLog ?? undefined,
      domSnapshot: result.domSnapshot,
      testTitle: result.testCase?.title,
    }
  );

  await testResultRepository.update(data.testResultId, {
    failureAnalysis: response.output.analysis as unknown as Prisma.InputJsonValue,
  });

  if (data.projectId) {
    await bugDetectionService.detect({
      projectId: data.projectId,
      testRunId: data.testRunId,
      testResultId: data.testResultId,
      organizationId: data.organizationId,
    });
  }

  logger.info({ testResultId: data.testResultId }, 'failure analysis stored');
};