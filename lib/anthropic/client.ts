import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;

export const anthropic = apiKey
  ? new Anthropic({ apiKey })
  : null;

export const ANTHROPIC_MODEL = 'claude-opus-4-5';

export function isAnthropicConfigured(): boolean {
  return Boolean(apiKey);
}
