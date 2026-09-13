import { env } from '../../config/environment';
import { UpstreamError } from '../../utils/errors';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
}

export interface LlmResponse {
  content: string;
  model: string;
  usage: LlmUsage;
  latencyMs: number;
}

const COST_PER_MILLION = {
  input: 0.15,
  output: 0.6,
};

export interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
}

export const getLlmConfig = (): LlmConfig | null => {
  if (!env.OPENAI_API_KEY) return null;
  return {
    apiKey: env.OPENAI_API_KEY,
    baseUrl: env.OPENAI_BASE_URL,
    defaultModel: env.LLM_MODEL,
    maxTokens: env.LLM_MAX_TOKENS,
    temperature: env.LLM_TEMPERATURE,
  };
};

export const llmService = {
  isConfigured(): boolean {
    return env.OPENAI_API_KEY !== undefined && env.OPENAI_API_KEY.length > 0;
  },

  async chat(messages: LlmMessage[], options: LlmOptions = {}): Promise<LlmResponse> {
    const config = getLlmConfig();
    if (!config) {
      throw new UpstreamError('LLM provider is not configured (OPENAI_API_KEY is missing)');
    }

    const startedAt = Date.now();
    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model ?? config.defaultModel,
          messages,
          temperature: options.temperature ?? config.temperature,
          max_tokens: options.maxTokens ?? config.maxTokens,
          ...(options.responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new UpstreamError(`LLM request failed with status ${response.status}`, body.slice(0, 500));
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
        model?: string;
      };

      const content = data.choices?.[0]?.message?.content ?? '';
      const inputTokens = data.usage?.prompt_tokens ?? 0;
      const outputTokens = data.usage?.completion_tokens ?? 0;
      const totalTokens = data.usage?.total_tokens ?? inputTokens + outputTokens;
      const costUsd =
        (inputTokens / 1_000_000) * COST_PER_MILLION.input +
        (outputTokens / 1_000_000) * COST_PER_MILLION.output;

      return {
        content,
        model: data.model ?? options.model ?? config.defaultModel,
        usage: { inputTokens, outputTokens, totalTokens, costUsd },
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      throw new UpstreamError('LLM request failed', (error as Error).message);
    }
  },

  async chatJson<T>(messages: LlmMessage[], options: LlmOptions = {}): Promise<{ data: T; usage: LlmUsage }> {
    const response = await llmService.chat(messages, { ...options, responseFormat: 'json_object' });
    try {
      const data = JSON.parse(response.content) as T;
      return { data, usage: response.usage };
    } catch {
      throw new UpstreamError('LLM returned malformed JSON', response.content.slice(0, 500));
    }
  },
};
