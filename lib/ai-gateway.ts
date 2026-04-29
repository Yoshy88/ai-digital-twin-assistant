import { createAnthropic } from '@ai-sdk/anthropic';
import { ollama } from 'ollama-ai-provider';

export function getModelInfo() {
  // Dev local — Ollama
  if (process.env.USE_OLLAMA === 'true' && !process.env.VERCEL) {
    return {
      provider: 'Ollama',
      model: process.env.OLLAMA_MODEL || 'qwen3-coder:30b',
    };
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Anthropic direct
  if (anthropicKey) {
    return {
      provider: 'Anthropic (Direct)',
      model: 'claude-haiku-4-5-20251001',
    };
  }

  return {
    provider: 'None',
    model: 'Not configured',
  };
}

export function getModel() {
  // Dev local — Ollama
  if (process.env.USE_OLLAMA === 'true' && !process.env.VERCEL) {
    console.log('Using Ollama:', process.env.OLLAMA_MODEL || 'qwen3-coder:30b');
    return ollama(process.env.OLLAMA_MODEL || 'qwen3-coder:30b');
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Anthropic direct
  if (anthropicKey) {
    console.log('Using Anthropic direct with claude-haiku-4-5-20251001');
    const claude = createAnthropic({
      apiKey: anthropicKey,
    });
    return claude('claude-haiku-4-5-20251001');
  }

  throw new Error(
    'No AI provider configured. Set USE_OLLAMA=true for local dev, or provide ANTHROPIC_API_KEY.'
  );
}