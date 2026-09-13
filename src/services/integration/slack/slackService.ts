import { UpstreamError } from '../../../utils/errors';
import type { IntegrationConfig } from '../integrationService';

export interface SlackConfig {
  botToken?: string;
  channel?: string;
}

const getConfig = (config: IntegrationConfig): SlackConfig => {
  const botToken = (config.botToken ?? config.accessToken ?? config.apiKey) as string | undefined;
  if (!botToken) {
    throw new UpstreamError('Slack bot token missing.');
  }
  return { botToken, channel: config.channel as string | undefined };
};

export const slackService = {
  async testConnection(config: IntegrationConfig): Promise<{ ok: boolean; message: string }> {
    try {
      const slack = getConfig(config);
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${slack.botToken}` },
      });
      const data = (await response.json()) as { ok?: boolean; team?: string };
      if (!data.ok) return { ok: false, message: 'Slack auth failed' };
      return { ok: true, message: `Connected to Slack team ${data.team ?? ''}` };
    } catch (error) {
      return { ok: false, message: (error as Error).message };
    }
  },

  async postMessage(config: IntegrationConfig, text: string, channel?: string): Promise<void> {
    const slack = getConfig(config);
    const targetChannel = channel ?? slack.channel;
    if (!targetChannel) {
      throw new UpstreamError('Slack channel is not configured.');
    }
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${slack.botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel: targetChannel, text }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      throw new UpstreamError(`Slack message failed: ${data.error ?? 'unknown error'}`);
    }
  },
};