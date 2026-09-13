import type { Request } from 'express';
import type { AuditActionType, Prisma } from '@prisma/client';
import { auditLogRepository } from '../../repositories/auditLog.repository';
import { pagination } from '../../utils/formatters';
import { logger } from '../../config/logger';
import type { ListResponse } from '../../types/api.types';

type AuditLogWithUser = Prisma.AuditLogGetPayload<{
  include: { user: { select: { id: true; email: true; name: true } } };
}>;

export interface AuditEvent {
  organizationId: string;
  userId: string;
  projectId?: string;
  actionType: AuditActionType;
  resourceType: string;
  resourceId: string;
  changes?: Prisma.InputJsonValue | Prisma.InputJsonObject;
  metadata?: Prisma.InputJsonValue | Prisma.InputJsonObject;
}

export interface AuditListFilters {
  page?: number;
  pageSize?: number;
  resourceType?: string;
}

export const auditService = {
  async log(event: AuditEvent, req?: Request): Promise<void> {
    try {
      await auditLogRepository.create({
        organizationId: event.organizationId,
        userId: event.userId,
        projectId: event.projectId,
        actionType: event.actionType,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        changes: event.changes,
        metadata: event.metadata,
        ipAddress: req?.ip,
        userAgent: typeof req?.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
      });
    } catch (error) {
      logger.warn({ err: error }, 'audit log write failed');
    }
  },

  async list(
    organizationId: string,
    filters: AuditListFilters = {}
  ): Promise<ListResponse<AuditLogWithUser>> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      auditLogRepository.list(organizationId, skip, pageSize, filters.resourceType),
      auditLogRepository.count(organizationId, filters.resourceType),
    ]);
    return pagination(items, total, { page, pageSize });
  },
};
