/**
 * /api/chat-gemini — Gemini-powered chat route
 *
 * Mirrors /api/chat/route.ts but uses Google Gemini instead of Claude.
 * The existing /api/chat route is NOT modified.
 *
 * Prerequisites:
 *   1. pnpm add @google/generative-ai --filter @showcase/web
 *   2. Add GEMINI_API_KEY=<your-key> to your .env / .env.local
 */

import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { TOOL_DEFINITIONS, type Patch } from '@showcase/shared';
import { supabaseAdmin } from '@/lib/supabase';
import { getRenderedConfig } from '@/lib/queries/page';
import { buildSystemBlocks, buildVisitorState } from '@/lib/prompts/system';
import {
  gemini,
  GEMINI_MODEL_PRO,
  appendGeminiLog,
  estimateGeminiCost,
} from '@/lib/gemini';
import type { FunctionDeclaration, Tool } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  pageSlug: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  watching?: { id: string; title: string; thumbnail: string | null } | null;
}

// ---------------------------------------------------------------------------
// Convert the shared TOOL_DEFINITIONS (Anthropic format) → Gemini FunctionDeclarations
// ---------------------------------------------------------------------------
function sanitizeSchemaForGemini(schema: any): any {
  if (Array.isArray(schema)) {
    return schema.map(sanitizeSchemaForGemini);
  }
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  const result: any = {};
  for (const [key, value] of Object.entries(schema)) {
    if (['anyOf', 'oneOf', 'allOf', '$ref', 'default', 'additionalProperties', '$schema'].includes(key)) {
      continue;
    }
    result[key] = sanitizeSchemaForGemini(value);
  }

  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    const nonNull = schema.anyOf.find((s: any) => s.type && s.type !== 'null');
    if (nonNull) {
      Object.assign(result, sanitizeSchemaForGemini(nonNull));
    } else {
      result.type = 'string';
    }
  }
  
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    const nonNull = schema.oneOf.find((s: any) => s.type && s.type !== 'null');
    if (nonNull) {
      Object.assign(result, sanitizeSchemaForGemini(nonNull));
    } else {
      result.type = 'string';
    }
  }

  return result;
}

function toGeminiTools(): Tool[] {
  const declarations: FunctionDeclaration[] = TOOL_DEFINITIONS.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: sanitizeSchemaForGemini((t as any).input_schema ?? {}),
  }));
  return [{ functionDeclarations: declarations }];
}

// ---------------------------------------------------------------------------
// Map a Gemini function call → our shared Patch type
// ---------------------------------------------------------------------------
function toolCallToPatch(name: string, args: Record<string, unknown>): Patch | null {
  switch (name) {
    case 'update_section':
      return { op: 'update_section', sectionId: args.sectionId as string, patch: (args.patch ?? {}) as any };
    case 'update_theme': {
      const raw = args as Record<string, unknown>;
      const isWrapped =
        raw && Object.keys(raw).length === 1 && 'patch' in raw && typeof raw.patch === 'object' && raw.patch !== null;
      return { op: 'update_theme', patch: (isWrapped ? raw.patch : raw) as any };
    }
    case 'set_filter':
      return { op: 'set_filter', filter: args as any };
    case 'set_sort':
      return { op: 'set_sort', sort: args as any };
    case 'add_section':
      return {
        op: 'add_section',
        sectionType: args.type as string,
        props: (args.props ?? {}) as any,
        position: (args.position ?? { index: -1 }) as any,
      };
    case 'remove_section':
      return { op: 'remove_section', sectionId: args.sectionId as string };
    case 'reorder_sections':
      return { op: 'reorder_sections', order: (args.order ?? []) as string[] };
    case 'request_more_content':
    case 'ask_user':
      return null;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const { pageSlug, message, history = [], watching = null } = (await req.json()) as ChatRequest;
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitor_id')?.value;

  if (!visitorId) {
    return new Response(JSON.stringify({ error: 'no visitor cookie' }), { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY is not set. Add it to your .env / .env.local.' }),
      { status: 500 },
    );
  }

  const config = await getRenderedConfig({ slug: pageSlug, visitorId });
  const sys = buildSystemBlocks();

  // Compact section summary (same logic as the Claude route)
  const sectionSummaries = config.sections.map((s) => {
    const props = s.props as Record<string, unknown>;
    const summary: Record<string, unknown> = { id: s.id, type: s.type };
    for (const [k, v] of Object.entries(props)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') {
        summary[k] = `[${v.length} ${k}]`;
      } else if (typeof v === 'object' && v !== null) {
        summary[k] = JSON.stringify(v).slice(0, 120);
      } else {
        summary[k] = v;
      }
    }
    return summary;
  });

  const visitorState = buildVisitorState(
    { sections: sectionSummaries, theme: config.theme, filter: config.filter, sort: config.sort },
    [],
  );

  // Build the system prompt text (Gemini uses a single string, not blocks)
  const systemText = [sys.role.text, sys.schemaCatalog.text, sys.editingRules.text].join('\n\n');

  // Convert chat history for Gemini (role names: 'user' | 'model')
  const geminiHistory = history.map((h) => ({
    role: h.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: h.content }],
  }));

  // Build the current user message text
  let userMessageText = visitorState;
  if (watching && typeof watching.id === 'string' && watching.id.length > 0) {
    userMessageText += `\n\n<playing_video>\n  id: ${watching.id}\n  title: ${watching.title || '(unknown)'}\n</playing_video>`;
  }
  userMessageText += '\n\nVisitor: ' + message;

  // SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

      const t0 = Date.now();
      const toolUses: Array<{ name: string; input: unknown }> = [];
      const patchesToWrite: Array<{ patch: Patch; rationale?: string }> = [];
      let assistantText = '';
      let inputTokens = 0;
      let outputTokens = 0;
      let stopReason: string | null = null;

      try {
        const model = gemini.getGenerativeModel({
          model: GEMINI_MODEL_PRO,
          systemInstruction: systemText,
          tools: toGeminiTools(),
        });

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(userMessageText);
        const response = result.response;

        stopReason = response.candidates?.[0]?.finishReason ?? null;

        // Token counts (may be undefined on older SDK versions)
        const usageMeta = response.usageMetadata;
        inputTokens  = usageMeta?.promptTokenCount     ?? 0;
        outputTokens = usageMeta?.candidatesTokenCount ?? 0;

        // Process response parts
        if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
          // empty or blocked candidate
          assistantText += '(Empty response from model)';
          send({ kind: 'text', text: '(Empty response from model)' });
        } else {
          for (const candidate of response.candidates ?? []) {
            for (const part of candidate.content?.parts ?? []) {
              if (part.text) {
                assistantText += part.text;
                send({ kind: 'text', text: part.text });
              }
              if (part.functionCall) {
                const { name, args } = part.functionCall;
                const input = (args ?? {}) as Record<string, unknown>;
                toolUses.push({ name, input });
                send({ kind: 'tool_use', name });

                const patch = toolCallToPatch(name, input);
                if (patch) {
                  patchesToWrite.push({ patch, rationale: (input as any)?.rationale });
                  send({ kind: 'patch', patch });
                } else if (name === 'request_more_content') {
                  send({ kind: 'request_more_content', input });
                } else if (name === 'ask_user') {
                  send({ kind: 'ask_user', input });
                }
              }
            }
          }
        }
      } catch (err) {
        send({ kind: 'error', message: (err as Error).message });
      }

      const cost = estimateGeminiCost(GEMINI_MODEL_PRO, { inputTokens, outputTokens });

      // Persist to Supabase (best-effort, same as Claude route)
      try {
        const db = supabaseAdmin();
        const { data: site } = await db.from('sites').select('id').eq('slug', pageSlug).single();
        if (site) {
          if (patchesToWrite.length > 0) {
            await db.from('preferences').insert(
              patchesToWrite.map((p) => ({
                visitor_id: visitorId,
                site_id: site.id,
                patch: p.patch,
                rationale: p.rationale ?? null,
                message_id: null,
              })),
            );
          }
          await db.from('chat_turns').insert({
            visitor_id: visitorId,
            site_id: site.id,
            user_message: message,
            assistant_message: assistantText || null,
            tool_uses: toolUses,
            cost_usd: cost,
            cache_hit_ratio: 0,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cache_read_tokens: 0,
            cache_creation_tokens: 0,
          });
        }
      } catch {
        // best-effort persistence
      }

      await appendGeminiLog({
        ts: new Date().toISOString(),
        visitorId,
        durationMs: Date.now() - t0,
        inputTokens,
        outputTokens,
        costUsd: cost,
        model: GEMINI_MODEL_PRO,
        toolUses,
        stopReason: String(stopReason ?? ''),
      });

      send({ kind: 'done', costUsd: cost });
      controller.enqueue(enc.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
