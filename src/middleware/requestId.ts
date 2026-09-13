import { Request, Response, NextFunction } from 'express';
import { generateRequestId } from '../utils/helpers';

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && incoming.length > 0 ? incoming.slice(0, 64) : generateRequestId();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};
