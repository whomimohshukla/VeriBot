import { Request, Response } from 'express';
import { authService } from '../../services/auth/authService';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };
  await authService.resendVerification(email);
  res.status(200).json(ok(null, { message: Messages.AUTH.RESET_EMAIL_SENT }));
};
