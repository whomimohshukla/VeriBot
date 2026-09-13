import { Request, Response } from 'express';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const health = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(ok({ status: 'up', timestamp: new Date().toISOString() }, { message: Messages.HEALTH.OK }));
};