# Decisions Log

Append-only. Every domain agent (schema-keeper, api-keeper, db-keeper, etc.) appends a one-line entry here when it makes a non-trivial decision. Format:

```
- YYYY-MM-DD — agent — short title.
  Decision: <what>.
  Why: <why>.
```

## 2026-04-29 — main session — Track D fixed: visitor state was bloating user message

- Resolved: cache hit ratio was stuck at 21% because `buildVisitorState` serialized full `sections.props` into the user message — including all 60 videos in the VideoGrid (~15K tokens). User message has no `cache_control`, so this content was sent uncached every turn.
- Fix: `app/api/chat/route.ts` now builds a compact `sectionSummaries` array — id, type, and a 1-line stub for each prop (arrays of objects collapse to `[N items]`, nested objects truncate to 120 chars). LLM has full schema knowledge from `SCHEMA_CATALOG`; it doesn't need the actual video data to call `update_section`.
- Result: cost per turn $0.33 → $0.034 (10×), cache hit ratio 21% → 80%, input tokens 21300 → 1366.
- Bonus finding: `role` block (782 tokens) is below Anthropic's 1024-token cache minimum, so its `cache_control` marker is silently skipped. No action needed — `schemaCatalog` (1342 tok) and `editingRules` (1053 tok) cache correctly.

## 2026-04-29 — main session — Track B complete, tag-matching quality TODO

- TODO (api-keeper / feed-curator): set_filter requireTags is exact-string. Claude often emits compound tags like "underwater photography" that don't match a filter on `'photography'`. Result: 0 visible videos when filter and Haiku-generated tags don't align. Mitigations: (a) substring/fuzzy match in VideoGrid.applyFilter, (b) prompt Claude to use consistent tag splits ("underwater" + "photography" instead of "underwater photography"), (c) feed-curator post-processes Haiku output to split compound tags. Choose one before showcase.

## 2026-04-29 — main session — known issues from v0 smoke test

- TODO (api-keeper): cache hit ratio is stuck at ~21% across turns. Tools array auto-caches and reads (5601 tokens). System blocks with explicit `cache_control` write on turn 1 (21319 tokens) but do NOT read on turn 2 despite identical content. Investigate whether SDK is serializing `cache_control` correctly or whether some subtle string difference in `buildSystemBlocks` breaks the match. Reproduce: send 2 sequential chat messages within 5 minutes; expected cacheReadTokens ≈ 26920, actual 5601.

## 2026-04-29 — main session — bootstrap

- Decision: pivot from "auto-decode any URL" to "hand-built YouTube clone with personalization." Mock data v0; youtube-adapter (CDP-intercepted youtubei) v0.5.
  Why: showcase impact > technical novelty. YouTube is universally recognized; hand-built shell eliminates Day-1 decoder risk.
- Decision: cookie-anonymous visitor identity. UUID in HttpOnly cookie. No login.
  Why: zero-friction showcase. Sticky preferences without authentication overhead.
- Decision: project root `cs_197/showcase/` (named `showcase` not `personalize` to keep room for non-YouTube clones later).
  Why: per user preference.
- Decision: 7 chat tools — `update_section`, `update_theme`, `set_filter`, `set_sort`, `add_section`, `remove_section`, `request_more_content`, `ask_user`.
  Why: covers aesthetic + behavioral personalization. `request_more_content` solves arbitrary-niche-query coverage when mock catalog is thin.
- Decision: 8 specialist subagents in `.claude/agents/` (research-runner, schema-keeper, template-author, api-keeper, db-keeper, feed-curator, youtube-adapter, debugger) + cache-doctor. Main session is orchestrator only.
  Why: prevent context bloat across multi-week build. Each agent owns disjoint slice; main session sees only summaries.
