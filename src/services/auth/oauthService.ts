import { env } from '../../config/environment';
import { logger } from '../../config/logger';
import { UpstreamError } from '../../utils/errors';

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export interface OAuthUserProfile {
  email: string;
  name: string;
  avatar?: string;
  providerUserId: string;
}

export const oauthService = {
  getProviderConfig(provider: 'github' | 'google' | 'jira' | 'slack'): OAuthProviderConfig | null {
    switch (provider) {
      case 'github':
        if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return null;
        return {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackUrl: env.GITHUB_OAUTH_CALLBACK_URL ?? `${env.APP_ORIGIN}/auth/callback/github`,
        };
      default:
        return null;
    }
  },

  getAuthorizationUrl(provider: 'github' | 'google' | 'jira' | 'slack', state: string): string {
    const config = oauthService.getProviderConfig(provider);
    if (!config) {
      throw new UpstreamError(`${provider} OAuth is not configured`);
    }
    switch (provider) {
      case 'github':
        return `https://github.com/login/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.callbackUrl)}&scope=repo&state=${state}`;
      default:
        throw new UpstreamError(`${provider} OAuth is not supported yet`);
    }
  },

  async exchangeCode(provider: 'github', code: string): Promise<OAuthUserProfile> {
    const config = oauthService.getProviderConfig(provider);
    if (!config) {
      throw new UpstreamError(`${provider} OAuth is not configured`);
    }
    logger.info({ provider }, 'exchanging oauth code');
    void code;
    throw new UpstreamError(`${provider} OAuth exchange is not implemented`);
  },
};
