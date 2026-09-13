import { Request, Response } from 'express';
import { organizationService } from '../../services/organization/organizationService';
import { ok } from '../../utils/formatters';
import { Messages } from '../../constants/messages';

export const deleteOrganization = async (req: Request, res: Response): Promise<void> => {
  const { organizationId } = req.params as { organizationId: string };
  await organizationService.softDelete(organizationId);
  res.status(200).json(ok(null, { message: Messages.ORG.DELETED }));
};