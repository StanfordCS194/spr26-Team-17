# Security

Security posture for the multi-site showcase (YouTube InnerTube + Amazon/Instagram intercept adapters).

## Threat model

This is an **operator-run educational showcase**, not multi-tenant production SaaS.

| Actor | Access | Notes |
|-------|--------|-------|
| Site visitor | Chat, UI patches, public `/api/*` | Identified by `visitor_id` cookie only |
| Server operator | Chrome cookies on disk | Amazon/IG/YouTube live feeds use **the operator's** logged-in sessions |
| Attacker | No direct cookie DB access | Risk is SSRF, prompt leakage, API cost abuse if mis-deployed |

**Safe deployments:** local dev, Vercel with `FEED_ADAPTER=mock`.  
**Unsafe:** public URL + live intercept feeds (all visitors share operator session for upstream fetches).

## Intercept adapters (YouTube, Amazon, Instagram)

Shared implementation: `apps/web/lib/innertube/chrome-cookies.ts`, `apps/web/lib/intercept/`.

| Control | Implementation |
|---------|----------------|
| Cookie values never logged | Count-only: `loaded N cookies for {domain}` |
| Read-only cookie DB | Snapshot copy; never write back to Chrome |
| Visitor cannot supply cookies | `fetchWithSession` uses disk cookies only |
| API error sanitization | `lib/intercept/security.ts` → `sanitizePublicReason()` |
| Input bounds | Query ≤256 chars; continuation token ≤4096 chars |
| ID validation | ASIN `^[A-Z0-9]{10}$`; Instagram media id ≤64 chars |

See also [`intercept-adapters.md`](./intercept-adapters.md).

## Chat & multimodal

| Control | Implementation |
|---------|----------------|
| SSRF on thumbnail fetch | `isAllowedOutboundImageUrl()` — HTTPS CDN allowlist only |
| Debug prompt leakage | `debug_request` / `debug_final` SSE gated by `chatDebugEventsEnabled()`; off in production unless `NEXT_PUBLIC_DEVTOOLS_ENABLED=true` |
| Visitor scoping | Patches persisted per `visitor_id` in Supabase |

## Secrets & logging

- `.env`, `.env.local` gitignored; service role key server-only (`supabaseAdmin`).
- `logs/*.jsonl` gitignored (Anthropic/Gemini request metadata stays local).
- Never commit API keys or Chrome profile directories.

## Dependencies

Run before deploy:

```bash
cd personalized-youtube
pnpm audit --audit-level=high
pnpm --filter @showcase/web build
```

Next.js is pinned to ≥15.5.18 (2026-05 security patches for Server Components / middleware).

## Production checklist

- [ ] `FEED_ADAPTER=mock` and `SHOWCASE_FEED_SOURCE=mock` on Vercel
- [ ] `NEXT_PUBLIC_DEVTOOLS_ENABLED=false` (or unset) in production
- [ ] `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` in env only, not repo
- [ ] Supabase service role never exposed to client
- [ ] Live intercept demos run locally with operator Chrome profile only

## OWASP mapping (summary)

| Risk | Mitigation |
|------|------------|
| A01 Broken access control | Visitor patches scoped by cookie; operator cookies not visitor-controlled |
| A02 Cryptographic failures | Secrets in env; cookies encrypted at rest in Chrome |
| A03 Injection | Zod patches; regex-validated ASINs; no HTML injection in intercept mappers |
| A07 Identification failures | No real auth by design; document limits |
| A10 SSRF | CDN allowlist on chat thumbnail fetch |
| Supply chain | `pnpm audit`, Next.js patch level |

TOS posture (same as YouTube adapter): intercept on the operator's own machine with their own accounts — reasonable for showcase; production requires official APIs and OAuth.
