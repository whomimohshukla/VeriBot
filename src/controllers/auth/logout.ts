import { Request, Response } from 'express';
import { authService } from '../../services/auth/authService';
import { ok } from '../../utils/formatters';
import { Messages } from '../../constants/messages';

export const logout = async (req: Request, res: Response): Promise<void> => {
  const header = req.headers.authorization;
  const accessToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const refreshToken = (req.body as { refreshToken?: string }).refreshToken;
  await authService.logout(accessToken, refreshToken);
  res.status(200).json(ok(null, { message: Messages.AUTH.LOGGED_OUT }));
};
