import type { NextRequest } from 'next/server';
import { anthropic, MODEL_OPUS, appendLog, estimateCost } from '@/lib/anthropic';
import { buildSystemBlocks, buildVisitorState } from '@/lib/prompts/system';
import { TOOL_DEFINITIONS, type PageConfig, type Patch } from '@showcase/shared';
import { ensureInstallVisitor, installCorsHeaders, optionsResponse, resolveInstallSite } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface InstallChatRequest {
  siteId: string;
  visitorId: string;
  message: string;
  pageSnapshot: Pick<PageConfig, 'sections' | 'theme' | 'filter' | 'sort'>;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const INSTALL_SUPPORTED_OPS = new Set([
  'update_section',
  'update_theme',
  'set_filter',
  'remove_section',
  'reorder_sections',
]);

export function OPTIONS(req: NextRequest) {
  return optionsResponse(req);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as InstallChatRequest;
  if (!body.siteId) return jsonError(req, 'siteId required', 400);
  if (!body.visitorId) return jsonError(req, 'visitorId required', 400);
  if (!body.message) return jsonError(req, 'message required', 400);
  if (!body.pageSnapshot) return jsonError(req, 'pageSnapshot required', 400);

  const { db, site, slug } = await resolveInstallSite(body.siteId);
  if (!site) return jsonError(req, `site not found: ${slug}`, 404);
  await ensureInstallVisitor(body.visitorId);

  const sys = buildSystemBlocks();
  const visitorState = buildVisitorState(body.pageSnapshot, []);
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...(body.history ?? []),
    {
      role: 'user',
      content: `${visitorState}\n\nThis visitor is using the installable static-site runtime. Only these patch ops are supported: ${Array.from(INSTALL_SUPPORTED_OPS).join(', ')}. If another tool would be useful, explain that it is not available in this install yet.\n\nVisitor: ${body.message}`,
    },
  ];

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
      const t0 = Date.now();
      const toolUses: Array<{ name: string; input: unknown }> = [];
      const patchesToWrite: Array<{ patch: Patch; messageId?: string; rationale?: string }> = [];
      let assistantText = '';
      let finalUsage: any = {};
      let stopReason: string | null = null;
      let lastMessageId: string | undefined;

      try {
        const response = anthropic.messages.stream({
          model: MODEL_OPUS,
          max_tokens: 1024,
          system: [sys.role, sys.schemaCatalog, sys.editingRules],
          tools: TOOL_DEFINITIONS,
          messages,
        } as any);

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
          if (block.type === 'text') {
            assistantText += block.text;
            continue;
          }
          if (block.type !== 'tool_use') continue;
          const tu = block as { name: string; input: any; id: string };
          toolUses.push({ name: tu.name, input: tu.input });
          const patch = toolUseToInstallPatch(tu);
          if (patch) {
            patchesToWrite.push({ patch, messageId: lastMessageId, rationale: tu.input?.rationale });
            send({ kind: 'patch', patch });
          } else {
            send({ kind: 'unsupported_tool', name: tu.name });
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
        if (patchesToWrite.length > 0) {
          await db.from('preferences').insert(
            patchesToWrite.map((p) => ({
              visitor_id: body.visitorId,
              site_id: site.id,
              patch: p.patch,
              rationale: p.rationale ?? null,
              message_id: p.messageId ?? null,
            })),
          );
        }
        await db.from('chat_turns').insert({
          visitor_id: body.visitorId,
          site_id: site.id,
          user_message: body.message,
          assistant_message: assistantText || null,
          tool_uses: toolUses,
          cost_usd: cost,
          cache_hit_ratio: cacheHitRatio,
          input_tokens: finalUsage.input_tokens ?? 0,
          output_tokens: finalUsage.output_tokens ?? 0,
          cache_read_tokens: cacheRead,
          cache_creation_tokens: cacheCreate,
          duration_ms: Date.now() - t0,
        });
      } catch {
        // best-effort persistence
      }

      await appendLog({
        ts: new Date().toISOString(),
        sessionId: lastMessageId,
        visitorId: body.visitorId,
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
      ...installCorsHeaders(req),
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

function jsonError(req: NextRequest, error: string, status: number) {
  return Response.json({ error }, { status, headers: installCorsHeaders(req) });
}

function toolUseToInstallPatch(tu: { name: string; input: any }): Patch | null {
  if (!INSTALL_SUPPORTED_OPS.has(tu.name)) return null;
  switch (tu.name) {
    case 'update_section':
      return { op: 'update_section', sectionId: tu.input.sectionId, patch: tu.input.patch ?? {} };
    case 'update_theme': {
      const raw = tu.input as Record<string, unknown>;
      const isWrapped =
        raw && typeof raw === 'object' &&
        Object.keys(raw).length === 1 &&
        'patch' in raw &&
        typeof raw.patch === 'object' && raw.patch !== null;
      return { op: 'update_theme', patch: (isWrapped ? raw.patch : raw) as any };
    }
    case 'set_filter':
      return { op: 'set_filter', filter: tu.input };
    case 'remove_section':
      return { op: 'remove_section', sectionId: tu.input.sectionId };
    case 'reorder_sections':
      return { op: 'reorder_sections', order: tu.input.order ?? [] };
    default:
      return null;
  }
}
