import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

const gateway = process.env.VERCEL_AI_GATEWAY_URL;
const apiKey = process.env.VERCEL_AI_API_KEY;

if (!gateway) {
  console.warn('Warning: VERCEL_AI_GATEWAY_URL is not defined');
}
if (!apiKey || apiKey === 'your_vercel_ai_gateway_key_here') {
  console.warn('Warning: VERCEL_AI_API_KEY is not set – gateway requests will fail');
}

export const anthropic = createAnthropic({
  baseURL: `${gateway}/anthropic`,
  apiKey: apiKey || '',
});

export const openai = createOpenAI({
  baseURL: `${gateway}/openai`,
  apiKey: apiKey || '',
});

// Provider Ollama local (API compatible OpenAI)
export const ollama = createOpenAI({
  baseURL: 'http://127.0.0.1:11434/v1',
  apiKey: 'ollama', 
});
