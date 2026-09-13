import { Request, Response } from 'express';
import { applicationService } from '../../services/application/applicationService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const scanApplication = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || !req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { applicationId } = req.params as { applicationId: string };
  const { environmentId, maxPages, testUserId } = req.body as {
    environmentId?: string;
    maxPages?: number;
    testUserId?: string;
  };
  const result = await applicationService.scan({
    applicationId,
    organizationId: req.orgId,
    environmentId,
    maxPages,
    testUserId,
    triggeredById: req.user.id,
  });
  res.status(200).json(ok(result, { message: Messages.APPLICATION.SCAN_STARTED }));
};
