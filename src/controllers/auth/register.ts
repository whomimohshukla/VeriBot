import { Request, Response } from 'express';
import { authService } from '../../services/auth/authService';
import { created } from '../../utils/formatters';
import { Messages } from '../../constants/messages';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, organizationName } = req.body as {
    email: string;
    password: string;
    name?: string;
    organizationName?: string;
  };
  const result = await authService.register({ email, password, name, organizationName }, req.ip);
  res.status(201).json(created(result, { message: Messages.AUTH.REGISTERED }));
};