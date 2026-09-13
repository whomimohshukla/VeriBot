import { Router } from 'express';

import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import organizationsRoutes from './organizations.routes';
import projectsRoutes from './projects.routes';
import applicationsRoutes from './applications.routes';
import testCasesRoutes from './testCases.routes';
import testSuitesRoutes from './testSuites.routes';
import testRunsRoutes from './testRuns.routes';
import bugsRoutes from './bugs.routes';
import agentsRoutes from './agents.routes';
import integrationsRoutes from './integrations.routes';
import webhooksRoutes from './webhooks.routes';
import analyticsRoutes from './analytics.routes';
import apiKeysRoutes from './apiKeys.routes';
import billingRoutes from './billing.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/organizations', organizationsRoutes);
router.use('/projects', projectsRoutes);
router.use('/applications', applicationsRoutes);
router.use('/test-cases', testCasesRoutes);
router.use('/test-suites', testSuitesRoutes);
router.use('/test-runs', testRunsRoutes);
router.use('/bugs', bugsRoutes);
router.use('/agents', agentsRoutes);
router.use('/integrations', integrationsRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/api-keys', apiKeysRoutes);
router.use('/billing', billingRoutes);
router.use('/health', healthRoutes);

export default router;
