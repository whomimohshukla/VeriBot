import { Job } from 'bullmq';
import type { ReportJobData } from '../queues/reportQueue';
import { reportService } from '../services/analytics/reportService';
import { logger } from '../config/logger';

export const processReportGenerationJob = async (job: Job<ReportJobData>): Promise<void> => {
  switch (job.name as string) {
    case 'generate-report':
    case 'generate-quality-score':
      await reportService.buildReport({
        organizationId: job.data.organizationId,
        projectId: job.data.projectId,
        testRunId: job.data.testRunId,
        periodStart: job.data.periodStart,
        periodEnd: job.data.periodEnd,
      });
      logger.info(
        { organizationId: job.data.organizationId, projectId: job.data.projectId },
        'report generated'
      );
      return;
    default:
      logger.warn({ jobName: job.name }, 'unhandled report queue job name');
  }
};
