import { Request, Response } from 'express';
import { organizationService } from '../../services/organization/organizationService';
import { ok } from '../../utils/formatters';

export const listMembers = async (req: Request, res: Response): Promise<void> => {
  const { organizationId } = req.params as { organizationId: string };
  const members = await organizationService.listMembers(organizationId);
  res.status(200).json(ok(members));
};