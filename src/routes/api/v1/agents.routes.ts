import { Router } from 'express';
import { triggerAgent, getAgentRun, listAgentRuns, cancelAgent } from '../../../controllers/agents';
import { authenticate, tenantMiddleware, validate, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';
import { triggerAgentSchema, agentParamsSchema, listAgentRunsQuerySchema } from '../../../validators';

const router = Router();

router.use(authenticate(), tenantMiddleware);

router.post('/trigger', requirePermission(Permissions.AGENT_TRIGGER), validate(triggerAgentSchema), triggerAgent);
router.get('/runs', requirePermission(Permissions.AGENT_READ), validate(listAgentRunsQuerySchema, 'query'), listAgentRuns);
router.get('/runs/:agentRunId', requirePermission(Permissions.AGENT_READ), validate(agentParamsSchema, 'params'), getAgentRun);
router.post('/runs/:agentRunId/cancel', requirePermission(Permissions.AGENT_TRIGGER), validate(agentParamsSchema, 'params'), cancelAgent);

export default router;