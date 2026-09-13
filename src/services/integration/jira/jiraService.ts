import { UpstreamError } from '../../../utils/errors';
import type { IntegrationConfig } from '../integrationService';

export interface JiraConfig {
  domain?: string;
  email?: string;
  apiToken?: string;
}

export interface CreateJiraIssueParams {
  projectKey: string;
  summary: string;
  description?: string;
  issueType?: string;
}

const getConfig = (config: IntegrationConfig): JiraConfig => {
  const domain = (config.domain ?? config.workspaceId ?? config.baseUrl) as string | undefined;
  const email = config.email as string | undefined;
  const apiToken = (config.apiKey ?? config.apiToken) as string | undefined;
  if (!domain || !email || !apiToken) {
    throw new UpstreamError('Jira credentials are incomplete (domain/email/apiToken).');
  }
  return { domain, email, apiToken };
};

export const jiraService = {
  async testConnection(config: IntegrationConfig): Promise<{ ok: boolean; message: string }> {
    try {
      const jira = getConfig(config);
      const response = await fetch(`https://${jira.domain}/rest/api/3/myself`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${jira.email}:${jira.apiToken}`).toString('base64')}`,
        },
      });
      if (!response.ok) return { ok: false, message: `Jira API returned ${response.status}` };
      return { ok: true, message: 'Connected to Jira' };
    } catch (error) {
      return { ok: false, message: (error as Error).message };
    }
  },

  async createIssue(config: IntegrationConfig, params: CreateJiraIssueParams): Promise<{ issueKey: string; issueUrl: string }> {
    const jira = getConfig(config);
    const response = await fetch(`https://${jira.domain}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${jira.email}:${jira.apiToken}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          project: { key: params.projectKey },
          summary: params.summary,
          description: params.description ?? '',
          issuetype: { name: params.issueType ?? 'Bug' },
        },
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new UpstreamError(`Jira failed to create issue (${response.status})`, text.slice(0, 500));
    }
    const issue = (await response.json()) as { key: string; self: string };
    return { issueKey: issue.key, issueUrl: `${jira.domain}/browse/${issue.key}`.replace(/^https?:\/\//, 'https://') };
  },
};