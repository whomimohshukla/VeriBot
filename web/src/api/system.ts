import { apiGet, apiPost, apiPatch, apiDelete, apiPaginated } from './client';
import type { Agent, AgentRun, Integration, Webhook, WebhookDelivery, ApiKey, Billing } from '../types';

export const usersApi = {
  me: () => apiGet<{ id: string; email: string; name: string | null; avatar: string | null }>('/users/me'),
  updateMe: (data: Record<string, unknown>) =>
    apiPatch<{ id: string; email: string; name: string | null }>('/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiPost<{ message: string }>('/users/me/change-password', data),
};

export const agentsApi = {
  trigger: (data: { agentType: string; projectId?: string; config?: Record<string, unknown> }) =>
    apiPost<{ runId: string }>('/agents/trigger', data),
  runs: (params?: Record<string, unknown>) =>
    apiPaginated<AgentRun>('/agents/runs', params),
  run: (id: string) => apiGet<AgentRun>(`/agents/runs/${id}`),
  cancelRun: (id: string) =>
    apiPost<{ message: string }>(`/agents/runs/${id}/cancel`),
};

export const integrationsApi = {
  list: () => apiGet<Array<Integration & { availability?: { configured: boolean; metadata?: Record<string, unknown> } }>>('/integrations'),
  connect: (data: { type: string; config: Record<string, unknown> }) =>
    apiPost<Integration>('/integrations', data),
  test: (id: string) =>
    apiPost<{ ok: boolean; message: string }>(`/integrations/${id}/test`),
  disconnect: (id: string) => apiDelete<{ message: string }>(`/integrations/${id}`),
};

export const webhooksApi = {
  list: () => apiGet<Webhook[]>('/webhooks'),
  get: (id: string) => apiGet<Webhook>(`/webhooks/${id}`),
  create: (data: { url: string; events: string[]; secret?: string }) =>
    apiPost<Webhook>('/webhooks', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiPatch<Webhook>(`/webhooks/${id}`, data),
  remove: (id: string) => apiDelete<{ message: string }>(`/webhooks/${id}`),
  triggerTest: (id: string) =>
    apiPost<{ message: string }>(`/webhooks/${id}/test`),
  deliveries: (id: string) =>
    apiGet<WebhookDelivery[]>(`/webhooks/${id}/deliveries`),
};

export const apiKeysApi = {
  list: () => apiGet<ApiKey[]>('/api-keys'),
  create: (data: { name: string; scopes?: string[] }) =>
    apiPost<ApiKey & { rawKey: string }>('/api-keys', data),
  revoke: (id: string) => apiDelete<{ message: string }>(`/api-keys/${id}`),
};

export const billingApi = {
  subscription: () => apiGet<Billing>('/billing/subscription'),
  updatePlan: (plan: string) =>
    apiPatch<Billing>('/billing/subscription', { plan }),
  usage: () => apiGet<{ testRunsUsed: number; testRunLimit: number; month: string }>('/billing/usage'),
};

export { apiGet, apiPost, apiPatch, apiDelete, apiPaginated };