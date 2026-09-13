import { Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { billingService } from '../../services/billing/billingService';

export const billingWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string | undefined;
  if (!signature) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body.toString('utf8')
    : typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body ?? {});
  const result = await billingService.handleStripeWebhook(signature, rawBody);
  res.status(200).json(ok(result));
};
