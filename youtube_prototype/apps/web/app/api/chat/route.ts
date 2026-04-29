import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { anthropic, MODEL_OPUS, appendLog, estimateCost } from '@/lib/anthropic';
import { buildSystemBlocks, buildVisitorState } from '@/lib/prompts/system';
import { TOOL_DEFINITIONS, applyPatches, type Patch } from '@showcase/shared';
import { supabaseAdmin } from '@/lib/supabase';
import { getRenderedConfig } from '@/lib/queries/page';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  pageSlug: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(req: NextRequest) {
  const { pageSlug, message, history = [] } = (await req.json()) as ChatRequest;
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitor_id')?.value;
  if (!visitorId) {
    return new Response(JSON.stringify({ error: 'no visitor cookie' }), { status: 400 });
  }

  const config = await getRenderedConfig({ slug: pageSlug, visitorId });
  const sys = buildSystemBlocks();

  // Compact section summary — id + type + a 1-line summary of the most useful props.
  // Crucially: drop heavy fields like videos[] from the prompt. The LLM only needs ids
  // and types to call update_section; it does NOT need to see the catalog.
  const sectionSummaries = config.sections.map((s) => {
    const props = s.props as Record<string, unknown>;
    const summary: Record<string, unknown> = { id: s.id, type: s.type };
    for (const [k, v] of Object.entries(props)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') {
        summary[k] = `[${v.length} ${k}]`; // e.g. [60 videos]
      } else if (typeof v === 'object' && v !== null) {
        summary[k] = JSON.stringify(v).slice(0, 120);
      } else {
        summary[k] = v;
      }
    }
    return summary;
  });

  const visitorState = buildVisitorState(
    {
      sections: sectionSummaries,
      theme: config.theme,
      filter: config.filter,
      sort: config.sort,
    },
    [],
  );

  const messages: Array<{ role: 'user' | 'assistant'; content: string | Array<{ type: 'text'; text: string }> }> = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    {
      role: 'user',
      content: [
        { type: 'text', text: visitorState },
        { type: 'text', text: '\n\nVisitor: ' + message },
      ],
    },
  ];

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

      const t0 = Date.now();
      const toolUses: Array<{ name: string; input: unknown }> = [];
      const patchesToWrite: Array<{ patch: Patch; messageId?: string; rationale?: string }> = [];
      let finalUsage: any = {};
      let stopReason: string | null = null;
      let lastMessageId: string | undefined;

      try {
        const response = anthropic.messages.stream({
          model: MODEL_OPUS,
          max_tokens: 1024,
          system: [sys.role, sys.schemaCatalog, sys.editingRules],
          tools: TOOL_DEFINITIONS as any,
          messages,
        });

        for await (const ev of response) {
          if (ev.type === 'message_start') lastMessageId = ev.message.id;
          if (ev.type === 'content_block_start' && ev.content_block.type === 'tool_use') {
            send({ kind: 'tool_use', name: ev.content_block.name });
          }
          if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
            send({ kind: 'text', text: ev.delta.text });
          }
          if (ev.type === 'message_delta') {
            stopReason = ev.delta.stop_reason ?? null;
            finalUsage = { ...finalUsage, ...ev.usage };
          }
        }

        const finalMessage = await response.finalMessage();
        finalUsage = finalMessage.usage;

        for (const block of finalMessage.content) {
          if (block.type !== 'tool_use') continue;
          const tu = block as { name: string; input: any; id: string };
          toolUses.push({ name: tu.name, input: tu.input });

          const patch = toolUseToPatch(tu);
          if (patch) {
            patchesToWrite.push({ patch, messageId: lastMessageId, rationale: tu.input?.rationale });
            send({ kind: 'patch', patch });
          } else if (tu.name === 'request_more_content') {
            send({ kind: 'request_more_content', input: tu.input });
          } else if (tu.name === 'ask_user') {
            send({ kind: 'ask_user', input: tu.input });
          }
        }
      } catch (err) {
        send({ kind: 'error', message: (err as Error).message });
      }

      const cacheRead = finalUsage.cache_read_input_tokens ?? 0;
      const cacheCreate = finalUsage.cache_creation_input_tokens ?? 0;
      const inputT = (finalUsage.input_tokens ?? 0) + cacheRead + cacheCreate;
      const cacheHitRatio = inputT > 0 ? cacheRead / inputT : 0;
      const cost = estimateCost(MODEL_OPUS, finalUsage);

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
                message_id: p.messageId ?? null,
              })),
            );
          }
          await db.from('chat_turns').insert({
            visitor_id: visitorId,
            site_id: site.id,
            user_message: message,
            assistant_message: null,
            tool_uses: toolUses,
            cost_usd: cost,
            cache_hit_ratio: cacheHitRatio,
            input_tokens: finalUsage.input_tokens ?? 0,
            output_tokens: finalUsage.output_tokens ?? 0,
            cache_read_tokens: cacheRead,
            cache_creation_tokens: cacheCreate,
          });
        }
      } catch {
        // best-effort persistence
      }

      await appendLog({
        ts: new Date().toISOString(),
        sessionId: lastMessageId,
        visitorId,
        durationMs: Date.now() - t0,
        inputTokens: finalUsage.input_tokens ?? 0,
        outputTokens: finalUsage.output_tokens ?? 0,
        cacheReadTokens: cacheRead,
        cacheCreationTokens: cacheCreate,
        cacheHitRatio,
        costUsd: cost,
        model: MODEL_OPUS,
        toolUses,
        stopReason,
      });

      send({ kind: 'done', cacheHitRatio, costUsd: cost });
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

function toolUseToPatch(tu: { name: string; input: any }): Patch | null {
  switch (tu.name) {
    case 'update_section':
      return { op: 'update_section', sectionId: tu.input.sectionId, patch: tu.input.patch ?? {} };
    case 'update_theme':
      return { op: 'update_theme', patch: tu.input };
    case 'set_filter':
      return { op: 'set_filter', filter: tu.input };
    case 'set_sort':
      return { op: 'set_sort', sort: tu.input };
    case 'add_section':
      return {
        op: 'add_section',
        sectionType: tu.input.type,
        props: tu.input.props ?? {},
        position: tu.input.position ?? { index: -1 },
      };
    case 'remove_section':
      return { op: 'remove_section', sectionId: tu.input.sectionId };
    case 'reorder_sections':
      return { op: 'reorder_sections', order: tu.input.order ?? [] };
    case 'request_more_content':
    case 'ask_user':
      return null;
    default:
      return null;
  }
}
