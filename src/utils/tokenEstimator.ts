import type { LLMProvider } from '../types';

const PRICING: Record<LLMProvider, number> = {
  openai: 0.0000025,
  anthropic: 0.000003,
  gemini: 0.00000125,
  ollama: 0,
};

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function calculateEstimatedCost(tokens: number, provider: LLMProvider): number {
  return tokens * (PRICING[provider] || 0);
}