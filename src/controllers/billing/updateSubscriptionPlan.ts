import { Request, Response } from 'express';
import { billingService } from '../../services/billing/billingService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const updateSubscriptionPlan = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { plan } = req.body as { plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE' };
  const subscription = await billingService.changePlan({ organizationId: req.orgId, plan });
  res.status(200).json(ok(subscription, { message: Messages.BILLING.PLAN_UPDATED }));
};
