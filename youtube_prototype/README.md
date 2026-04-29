# Showcase — Personalizable YouTube Clone

Talk to your homepage. Personalize the look, the recommendations, and the layout. Preferences stick across reloads.

A **chat-driven personalization showcase**: visitors land on a hand-built YouTube-shaped homepage, type any prompt to personalize it (*"green dark theme, hide shorts, more chill jazz, less bangers, square thumbnails"*), and the page updates live. Returning visitors get their personalized view automatically.

**Status**: v0 build (Day 1).

## Quick start

```bash
# Install deps (after granting Supabase + Anthropic keys)
pnpm install

# Wire up env
cp .env.example .env.local
# Fill in: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Run Supabase migration
# (via Supabase dashboard SQL editor, or CLI: supabase migration up)
psql "$SUPABASE_DB_URL" < supabase/migrations/0001_init.sql

# Generate the mock catalog (300 videos × 30 categories)
pnpm seed

# Dev server
pnpm dev
```

Open http://localhost:3000.

## Architecture in one sentence

Visitor cookie → fetch base PageConfig + their preference patches from Supabase → fold via `applyPatches` → render. Chat input streams Claude tool_use blocks → each tool_use becomes a Zod-validated patch → patch persists to `preferences` AND streams to the iframe for live update.

Full plan: `~/.claude/plans/yes-absolutely-and-sleepy-dewdrop.md`.
Architecture detail: `docs/architecture.md`.

## How dev works (the delegation pipeline)

The main Claude Code session is an **orchestrator**, not an implementer. Eight specialist subagents in `.claude/agents/` own disjoint slices of the codebase. When you ask for a change, the main session delegates to the right agent and gets a 3-line summary back — never accumulating implementation details.

| Agent | Owns |
|---|---|
| `research-runner` | `docs/research.md` (Day 1 only) |
| `schema-keeper` | `packages/shared/src/schemas/` |
| `template-author` | `apps/web/components/templates/` |
| `api-keeper` | `app/api/chat`, `lib/prompts/`, `lib/anthropic.ts` |
| `db-keeper` | `supabase/migrations/`, `lib/supabase.ts`, `lib/queries/` |
| `feed-curator` | `lib/mock-data/`, `lib/adapters/mock.ts`, `scripts/seed.ts` |
| `youtube-adapter` (Week 2) | `apps/desktop/`, `lib/adapters/youtube.ts` |
| `debugger` | `__tests__/replays/`, log inspection |

Plus `cache-doctor` for prompt-cache hit-ratio audits.

## Stack

- Next.js 15 + React 19 + Tailwind 3.4
- Zustand + zundo (in-tab undo)
- Supabase (database + storage; cookie-anonymous, no auth in v0)
- Anthropic SDK with `claude-opus-4-7` for chat, `claude-haiku-4-5-20251001` for catalog gen
- pnpm workspaces; one app (`apps/web`) + `packages/shared` for v0; `apps/desktop` Electron sidecar in v0.5

## Recommended prompts (try these — anything also works)

- *"Use a forest green dark theme"*
- *"Show me more chill jazz, less high-energy"*
- *"Hide videos shorter than 5 minutes"*
- *"Square thumbnails, larger size"*
- *"Compact layout, more videos visible"*
- *"Hide the shorts row"*
- *"Show creator names bigger than titles"*
- *"Show me competitive Mahjong streams"*  ← arbitrary niche; catalog grows on demand
