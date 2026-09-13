import { Request, Response } from 'express';
import { authService } from '../../services/auth/authService';
import { ok } from '../../utils/formatters';
import { Messages } from '../../constants/messages';

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body as { refreshToken: string };
  const result = await authService.refreshTokens(token);
  res.status(200).json(ok(result, { message: Messages.AUTH.TOKEN_REFRESHED }));
};