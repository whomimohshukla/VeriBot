import { UpstreamError } from '../../../utils/errors';
import type { IntegrationConfig } from '../integrationService';

interface GithubClientConfig {
  token?: string;
  baseUrl?: string;
}

const getClient = (config: IntegrationConfig): GithubClientConfig => {
  const token = config.accessToken ?? config.token;
  if (!token) {
    throw new UpstreamError('GitHub access token is missing.');
  }
  return { token, baseUrl: config.baseUrl ?? 'https://api.github.com' };
};

export interface CreateIssueParams {
  title: string;
  body?: string;
  labels?: string[];
  repository: string;
}

export const githubService = {
  async testConnection(config: IntegrationConfig): Promise<{ ok: boolean; message: string }> {
    try {
      const client = getClient(config);
      const response = await fetch(`${client.baseUrl}/user`, {
        headers: { Authorization: `token ${client.token}` },
      });
      if (!response.ok) {
        return { ok: false, message: `GitHub API returned ${response.status}` };
      }
      const user = (await response.json()) as { login?: string };
      return { ok: true, message: `Connected as ${user.login ?? 'user'}` };
    } catch (error) {
      return { ok: false, message: (error as Error).message };
    }
  },

  async listRepositories(config: IntegrationConfig) {
    const client = getClient(config);
    const response = await fetch(`${client.baseUrl}/user/repos?per_page=100&sort=updated`, {
      headers: { Authorization: `token ${client.token}` },
    });
    if (!response.ok) {
      throw new UpstreamError(`GitHub API returned ${response.status}`);
    }
    return (await response.json()) as Array<{ full_name: string; name: string; html_url: string; default_branch: string }>;
  },

  async createIssue(config: IntegrationConfig, params: CreateIssueParams): Promise<{ issueUrl: string }> {
    const client = getClient(config);
    const response = await fetch(`${client.baseUrl}/repos/${params.repository}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `token ${client.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: params.title,
        body: params.body,
        labels: params.labels,
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new UpstreamError(`GitHub failed to create issue (${response.status})`, text.slice(0, 500));
    }
    const issue = (await response.json()) as { html_url: string; number: number };
    return { issueUrl: issue.html_url };
  },
};