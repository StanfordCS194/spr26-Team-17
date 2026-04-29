# Architecture

## Data flow

```
┌──────────────┐                                   ┌─────────────────┐
│  Visitor     │                                   │ basePageConfig  │
│  Browser     │                                   │ (sites table)   │
│              │                                   └────────┬────────┘
│  cookie:     │                                            │
│  visitor_id  │   GET /api/page                            │
│              │ ─────────────────────►  ┌──────────────┐   │
│              │                         │ middleware:  │ ◄─┘
│              │                         │ read cookie  │
│              │                         │ load patches │
│              │ ◄─── rendered config ── │ fold + render│
│              │                                            
│  types in    │   POST /api/chat (SSE)                     
│  chat panel  │ ─────────────────────►  ┌──────────────┐
│              │                         │ Anthropic    │
│              │                         │ Opus 4.7     │
│              │                         │ tool_use     │
│              │                         │ streaming    │
│              │ ◄─── patch event ─ ──── │              │
│              │                         │              │
│              │                         │ writes       │
│              │                         │ preferences  │
│              │                         │ row          │
└──────────────┘                         └──────────────┘
```

## Patch-folding algorithm

Rendered config = `applyPatches(basePageConfig, visitorPatches)`.

`visitorPatches` is the ordered list of `tool_use` payloads from the visitor's `preferences` table. Apply in `created_at` order; conflicts resolve last-write-wins.

Each patch is one of:
- `update_section({sectionId, patch})` → `deepMerge(sections[id].props, patch)`.
- `update_theme(themePatch)` → `deepMerge(theme, themePatch)`.
- `set_filter(filter)` → replace `filter` field on the FilterSummary section + flag VideoGrid for re-filter.
- `set_sort(sort)` → replace `sort` field similarly.
- `add_section({type, props, position})` → splice into `sections` array.
- `remove_section({sectionId})` → filter out by id.
- `request_more_content` → pure side effect; doesn't modify config (catalog grows externally).
- `ask_user` → no patch; awaits user reply.

## Cache breakpoint structure (4 segments)

In every chat API call, the system message has 4 cache_control breakpoints, in this order:

1. **System role + tool definitions** — stable across all visitors, all sessions.
2. **Section schema catalog + tag vocabulary** — stable across all sessions; changes only when schema-keeper adds a section type.
3. **Editing rules + few-shot examples** — stable; changes only when api-keeper updates prompts.
4. **Per-visitor state** — current page snapshot + recent preference summary. NOT cacheable across visitors but cacheable within a visitor's session.

Anything that lands *before* breakpoint 4 busts the cache for all visitors. After any prompt change, run `cache-doctor`.

## Adapter pattern

`apps/web/lib/adapters/index.ts` selects an adapter based on `FEED_ADAPTER` env var:

- `mock` (v0): reads `apps/web/lib/mock-data/videos.json`.
- `youtube` (v0.5): IPC-fetches from `apps/desktop/` Electron sidecar at `http://localhost:7321/getFeed`.

Both implement:
```ts
interface FeedAdapter {
  getFeed(): Promise<{ videos: Video[]; categories: string[] }>
  requestMoreContent?(category: string, count: number, style?: string): Promise<Video[]>
}
```

The personalization layer calls only `getFeed()` and is unaware of the adapter source.

## Streaming / optimistic apply

1. Visitor sends a chat message.
2. SSE endpoint calls `messages.stream` with the 4-breakpoint system + chat history + the new user message.
3. On each `content_block_start` of type `tool_use`, push a placeholder ("Editing hero…") to the SSE client.
4. On each `content_block_stop`, validate accumulated input via the matching Zod schema:
   - **Valid** → apply patch optimistically to the iframe via state update; write `preferences` row to Supabase.
   - **Invalid** → emit `error` event; queue retry with the validation error appended as `tool_result.is_error: true`.
5. After `message_stop`, write `chat_turns` row with cost / cache metrics.

## Persistence model

- `sites` — one row per fixture (currently just `youtube-clone`). `base_config` jsonb is the full PageConfig.
- `visitors` — one row per cookie UUID. Created lazily on first chat or page load.
- `preferences` — append-only patches; one row per `tool_use`. Indexed on `(visitor_id, site_id, created_at)`.
- `chat_turns` — one row per chat exchange; cost/cache metrics for analysis. Not used for replay (use `preferences` instead).

Reset preferences → `DELETE FROM preferences WHERE visitor_id = ? AND site_id = ?`.

## In-tab undo

Zustand store wrapped with `zundo` middleware. Each completed assistant turn (multiple tool_uses grouped via `handleSet` deferred commit on `message_stop`) is one undo step. Cmd-Z reverts the last turn; Cmd-Shift-Z redoes. State capped at 100 steps.

Note: undo is in-tab only and does NOT delete the `preferences` row. Refresh restores the persisted state.
