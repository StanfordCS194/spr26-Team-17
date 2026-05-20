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
export const GEMINI_MODEL_PRO   = 'gemini-2.5-pro';
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

import { TOOL_DEFINITIONS, type Patch } from '@showcase/shared';
import type { FunctionDeclaration, Tool } from '@google/generative-ai';

function sanitizeSchemaForGemini(schema: any): any {
  if (Array.isArray(schema)) return schema.map(sanitizeSchemaForGemini);
  if (typeof schema !== 'object' || schema === null) return schema;
  const result: any = {};
  for (const [key, value] of Object.entries(schema)) {
    if (['anyOf', 'oneOf', 'allOf', '$ref', 'default', 'additionalProperties', '$schema'].includes(key)) continue;
    result[key] = sanitizeSchemaForGemini(value);
  }
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    const nonNull = schema.anyOf.find((s: any) => s.type && s.type !== 'null');
    if (nonNull) Object.assign(result, sanitizeSchemaForGemini(nonNull));
    else result.type = 'string';
  }
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    const nonNull = schema.oneOf.find((s: any) => s.type && s.type !== 'null');
    if (nonNull) Object.assign(result, sanitizeSchemaForGemini(nonNull));
    else result.type = 'string';
  }
  return result;
}

export function toGeminiTools(): Tool[] {
  const declarations: FunctionDeclaration[] = TOOL_DEFINITIONS.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: sanitizeSchemaForGemini((t as any).input_schema ?? {}),
  }));
  return [{ functionDeclarations: declarations }];
}

export function toolCallToPatch(name: string, args: Record<string, unknown>): Patch | null {
  switch (name) {
    case 'update_section':
      return { op: 'update_section', sectionId: args.sectionId as string, patch: (args.patch ?? {}) as any };
    case 'update_theme': {
      const raw = args as Record<string, unknown>;
      const isWrapped = raw && Object.keys(raw).length === 1 && 'patch' in raw && typeof raw.patch === 'object' && raw.patch !== null;
      return { op: 'update_theme', patch: (isWrapped ? raw.patch : raw) as any };
    }
    case 'set_filter': return { op: 'set_filter', filter: args as any };
    case 'set_sort': return { op: 'set_sort', sort: args as any };
    case 'add_section':
      return { op: 'add_section', sectionType: args.type as string, props: (args.props ?? {}) as any, position: (args.position ?? { index: -1 }) as any };
    case 'remove_section': return { op: 'remove_section', sectionId: args.sectionId as string };
    case 'reorder_sections': return { op: 'reorder_sections', order: (args.order ?? []) as string[] };
    case 'request_more_content':
    case 'ask_user':
      return null;
    default: return null;
  }
}
