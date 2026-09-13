import { Request, Response } from 'express';
import { applicationService } from '../../services/application/applicationService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';

export const addTestUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const applicationId = (req.params as { applicationId: string }).applicationId;
  const { environmentId, username, email, password, role, description } = req.body as {
    environmentId: string;
    username: string;
    email?: string;
    password: string;
    role?: string;
    description?: string;
  };
  await applicationService.assertProjectAccess(req.orgId, applicationId);
  const testUser = await applicationService.addTestUser({
    applicationId,
    environmentId,
    username,
    email,
    password,
    role,
    description,
  });
  res.status(201).json(created(testUser, { message: Messages.APPLICATION.TEST_USER_ADDED }));
};
