import { testResultRepository } from '../../repositories/testResult.repository';
import { bugDetectionAgent } from '../ai/bugDetectionAgent';
import { fallbackAnalysis, type FailureAnalyzerInput } from '../ai/failureAnalyzerAgent';
import { bugService } from './bugService';
import { logger } from '../../config/logger';

export interface DetectBugsParams {
  organizationId: string;
  projectId: string;
  testRunId: string;
  testResultId?: string;
  testCaseId?: string;
  failingResults?: Array<{ testResultId: string; testCaseId: string; testCaseTitle: string }>;
}

export const bugDetectionService = {
  async detect(params: DetectBugsParams): Promise<{ bugsCreated: number }> {
    const failingEntries =
      params.failingResults && params.failingResults.length > 0
        ? params.failingResults
        : [
            {
              testResultId: params.testResultId ?? '',
              testCaseId: params.testCaseId ?? '',
              testCaseTitle: '',
            },
          ];

    let bugsCreated = 0;
    for (const failing of failingEntries) {
      try {
        const testResult = failing.testResultId
          ? await testResultRepository.findById(failing.testResultId)
          : params.testCaseId
            ? await testResultRepository.findByRunAndCase(params.testRunId, params.testCaseId)
            : null;
        if (testResult?.bugId) continue;

        const input: FailureAnalyzerInput = {
          errorMessage: testResult?.errorMessage ?? undefined,
          stackTrace: testResult?.stackTrace ?? undefined,
          consoleLog: testResult?.consoleLog ?? [],
          domSnapshot: testResult?.domSnapshot,
          networkLog: testResult?.networkLog,
          testTitle: failing.testCaseTitle,
        };
        const analysis = fallbackAnalysis(input);
        const detection = await bugDetectionAgent.execute(
          { testRunId: params.testRunId, testCaseId: testResult?.testCaseId },
          {
            testTitle: failing.testCaseTitle,
            analysis,
            expectation: testResult?.testCase?.expectedResult ?? undefined,
          }
        );

        if (detection.output.suspicious && detection.output.candidate) {
          const bug = await bugService.createFromDetection({
            projectId: params.projectId,
            organizationId: params.organizationId,
            testCaseId: (testResult?.testCaseId ?? failing.testCaseId) || undefined,
            testRunId: params.testRunId,
            candidate: detection.output.candidate,
          });
          if (testResult) {
            await testResultRepository.updateBug(params.testRunId, testResult.testCaseId, bug.id);
          }
          bugsCreated += 1;
        }
      } catch (error) {
        logger.error({ err: error, testCaseId: failing.testCaseId }, 'bug detection failed for result');
      }
    }

    return { bugsCreated };
  },
};
