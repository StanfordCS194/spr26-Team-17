/**
 * gemini.ts — Google Gemini client
 *
 * Mirrors the shape of lib/anthropic.ts so the chat-gemini route can use it
 * the same way the main chat route uses the Anthropic client.
 *
 * Requires the `@google/generative-ai` package:
 *   pnpm add @google/generative-ai --filter @showcase/web
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const apiKey = process.env.GEMINI_API_KEY ?? '';

export const gemini = new GoogleGenerativeAI(apiKey);

// Model aliases — adjust to whichever Gemini models you have access to.
export const GEMINI_MODEL_PRO  = 'gemini-2.5-flash';
export const GEMINI_MODEL_FLASH = 'gemini-2.5-flash';

const LOG_PATH = process.cwd() + '/../../logs/gemini.jsonl';

export interface GeminiLogEntry {
  ts: string;
  sessionId?: string;
  visitorId?: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  model: string;
  toolUses: Array<{ name: string; input: unknown }>;
  stopReason?: string | null;
  error?: string;
}

export async function appendGeminiLog(entry: GeminiLogEntry) {
  try {
    await mkdir(dirname(LOG_PATH), { recursive: true });
    await appendFile(LOG_PATH, JSON.stringify(entry) + '\n');
  } catch {
    // logging is best-effort; don't crash the request
  }
}

// Very rough cost estimate — update if pricing changes.
// Gemini 1.5 Pro: ~$3.50 / 1M input tokens, ~$10.50 / 1M output tokens (as of mid-2025).
const COST_PER_M = {
  [GEMINI_MODEL_PRO]:   { in: 3.5,  out: 10.5 },
  [GEMINI_MODEL_FLASH]: { in: 0.075, out: 0.3  },
} as const;

export function estimateGeminiCost(
  model: string,
  usage: { inputTokens?: number; outputTokens?: number },
) {
  const c = COST_PER_M[model as keyof typeof COST_PER_M] ?? COST_PER_M[GEMINI_MODEL_PRO];
  return ((usage.inputTokens ?? 0) * c.in + (usage.outputTokens ?? 0) * c.out) / 1_000_000;
}
