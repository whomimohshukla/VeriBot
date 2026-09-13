import { Request, Response } from 'express';
import { authService } from '../../services/auth/authService';
import { ok } from '../../utils/formatters';
import { Messages } from '../../constants/messages';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login({ email, password });
  res.status(200).json(ok(result, { message: Messages.AUTH.LOGGED_IN }));
};
