import { Request, Response } from 'express';
import { authService } from '../../services/auth/authService';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token: string };
  await authService.verifyEmail(token);
  res.status(200).json(ok(null, { message: Messages.AUTH.VERIFIED }));
};