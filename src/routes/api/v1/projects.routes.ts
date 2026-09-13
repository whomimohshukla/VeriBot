import { Router } from 'express';
import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  archiveProject,
  listProjects,
  getProjectDashboard,
} from '../../../controllers/projects';
import { authenticate, tenantMiddleware, validate, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';
import {
  createProjectSchema,
  updateProjectSchema,
  projectParamsSchema,
  listProjectsQuerySchema,
} from '../../../validators';

const router = Router();

router.use(authenticate(), tenantMiddleware);

router.post('/', requirePermission(Permissions.PROJECT_CREATE), validate(createProjectSchema), createProject);
router.get(
  '/',
  requirePermission(Permissions.PROJECT_READ),
  validate(listProjectsQuerySchema, 'query'),
  listProjects
);
router.get('/dashboard', requirePermission(Permissions.PROJECT_READ), getProjectDashboard);
router.get(
  '/:projectId',
  requirePermission(Permissions.PROJECT_READ),
  validate(projectParamsSchema, 'params'),
  getProject
);
router.patch(
  '/:projectId',
  requirePermission(Permissions.PROJECT_UPDATE),
  validate(projectParamsSchema, 'params'),
  validate(updateProjectSchema),
  updateProject
);
router.delete(
  '/:projectId',
  requirePermission(Permissions.PROJECT_DELETE),
  validate(projectParamsSchema, 'params'),
  deleteProject
);
router.patch(
  '/:projectId/archive',
  requirePermission(Permissions.PROJECT_UPDATE),
  validate(projectParamsSchema, 'params'),
  archiveProject
);

export default router;
