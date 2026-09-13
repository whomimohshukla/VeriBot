import { Request, Response } from 'express';
import { billingService } from '../../services/billing/billingService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const getSubscription = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const subscription = await billingService.getOrCreate(req.orgId);
  res.status(200).json(ok(subscription));
};