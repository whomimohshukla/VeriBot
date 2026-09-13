import { UpstreamError } from '../../../utils/errors';
import type { IntegrationConfig } from '../integrationService';

export interface RepositoryServiceParams {
  config: IntegrationConfig;
  repository: string;
}

export const repositoryService = {
  async getRepository(config: IntegrationConfig, repository: string) {
    const token = config.accessToken ?? config.token;
    if (!token) throw new UpstreamError('GitHub access token missing.');
    const baseUrl = (config.baseUrl ?? 'https://api.github.com') as string;
    const response = await fetch(`${baseUrl}/repos/${repository}`, {
      headers: { Authorization: `token ${token}` },
    });
    if (!response.ok) throw new UpstreamError(`GitHub API returned ${response.status}`);
    return response.json();
  },

  async getFileTree(config: IntegrationConfig, repository: string, ref = 'HEAD') {
    const token = config.accessToken ?? config.token;
    if (!token) throw new UpstreamError('GitHub access token missing.');
    const baseUrl = (config.baseUrl ?? 'https://api.github.com') as string;
    const response = await fetch(`${baseUrl}/repos/${repository}/git/trees/${ref}?recursive=1`, {
      headers: { Authorization: `token ${token}` },
    });
    if (!response.ok) throw new UpstreamError(`GitHub API returned ${response.status}`);
    const data = (await response.json()) as { tree?: Array<{ path?: string; type?: string }> };
    return (data.tree ?? []).filter((entry) => entry.type === 'blob').map((entry) => entry.path);
  },
};
