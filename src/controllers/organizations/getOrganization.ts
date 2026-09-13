import { Request, Response } from 'express';
import { organizationService } from '../../services/organization/organizationService';
import { ok } from '../../utils/formatters';

export const getOrganization = async (req: Request, res: Response): Promise<void> => {
  const { organizationId } = req.params as { organizationId: string };
  const organization = await organizationService.get(organizationId);
  res.status(200).json(ok(organization));
};
