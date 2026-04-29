import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { ollama } from 'ollama-ai-provider';

export function getModel() {
  if (process.env.USE_OLLAMA === 'true' && !process.env.VERCEL) {
    return ollama(process.env.OLLAMA_MODEL || 'qwen3-coder:30b');
  }

  const gateway = process.env.VERCEL_AI_GATEWAY_URL;
  const apiKey = process.env.VERCEL_AI_API_KEY;

  if (!gateway) {
    console.warn('Warning: VERCEL_AI_GATEWAY_URL is not defined');
  }
  if (!apiKey || apiKey === 'your_vercel_ai_gateway_key_here') {
    console.warn('Warning: VERCEL_AI_API_KEY is not set – gateway requests will fail');
  }

  const claude = createAnthropic({
    baseURL: `${gateway}/anthropic`,
    apiKey: apiKey || '',
  });

  return claude('claude-3-5-haiku-20241022');
}
