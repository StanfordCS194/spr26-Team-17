# Slack utility surface

Fourth showcase site — **utility** tier (per Caleb's recommendation: Docs / Notion / Slack).

## Why Slack (not Docs or Notion)

| Option | Fit with showcase |
|--------|-------------------|
| **Slack** ✅ | Channel/message feed maps to existing `Video[]` card grid; sidebar + search chrome; live intercept via Slack Web API + Chrome cookies |
| Notion | Page/block tree needs new section types; official API needs integration token |
| Google Docs | Single-document editor — no feed model; heavy OAuth |

## Default UI (Slack-faithful)

The default layout mirrors **Slack desktop**, not the generic YouTube-style grid:

```
┌──────────────┬─────────────────────────────────┐
│ Purple       │  # channel-name    ★  👥  🔍   │
│ sidebar      │  Topic: …                       │
│              ├─────────────────────────────────┤
│ Workspace ▼  │  [avatar] Author      9:42 AM   │
│ Search…      │           Message text…         │
│              │  [avatar] Author      …         │
│ Threads      ├─────────────────────────────────┤
│ Channels     │  Message #channel…        ➤   │
│ Direct msgs  └─────────────────────────────────┘
```

- **No** global top bar or YouTube-style category chips by default
- Sidebar lists **real channels/DMs** when live intercept is active
- Chat personalization can restyle theme/sections later — the shell is the baseline

Seed the DB row:

```bash
cd personalized-youtube
pnpm seed:sites
```

Visit http://localhost:3000/slack (with dev server running).

## Live intercept setup

1. Log in to **app.slack.com** in Chrome (same profile as `CHROME_COOKIE_PATH`).
2. Copy your **xoxc** token (DevTools → Console):

```js
JSON.parse(localStorage.localConfig_v2).teams[document.location.pathname.match(/^\/client\/([A-Z0-9]+)/)[1]].token
```

3. Add to `.env`:

```bash
SLACK_XOXC=xoxc-…
CHROME_COOKIE_PATH="/Users/you/Library/Application Support/Google/Chrome/Profile 1/Cookies"
```

4. Smoke test:

```bash
pnpm check:feeds
pnpm --filter @showcase/web dev
```

Open `/slack` — you should see your real workspace name, channel list, and messages from the default channel (`general` unless `SLACK_DEFAULT_CHANNEL` is set).

**Deploy:** keep `FEED_ADAPTER=mock` on Vercel. Live Slack stays local-only (operator session). `/api/slack/*` returns 403 in production unless `SLACK_INTERCEPT_ENABLED=true` (do not enable on public deploy).

## Security

Slack intercept uses **your** Chrome cookies and xoxc token on the server — same threat model as Amazon/Instagram. Hardening:

- Token/cookie values never logged; xoxc patterns stripped from public errors
- Strict channel ID + thread timestamp validation on all API routes
- Slack API method allowlist (no arbitrary proxy)
- No mock fallback when auth fails — empty feed + setup banner only
- Blocked when `FEED_ADAPTER=mock` or production without `SLACK_INTERCEPT_ENABLED=true`

Full checklist: [`security.md`](./security.md).

## Data model

Each `Video` row represents a **message preview**:

| Field | Slack meaning |
|-------|----------------|
| `tags` `author:…` | Message author display name |
| `tags` `slackch:…` | Channel or DM key for sidebar filter |
| `tags` `slackcid:…` | Slack channel ID (live intercept) |
| `channel.name` | `# channel` or DM peer name |
| `title` | Message text preview |
| `duration` | Timestamp (`9:42 AM`, `Yesterday`) |
| `description` | Message body |
| `tags` | `slack`, `channel` \| `dm` \| `thread` |

Parser helpers: `apps/web/lib/slack/message.ts`  
Live client: `apps/web/lib/slack/client.ts`

See [`intercept-adapters.md`](./intercept-adapters.md) for the shared security contract.
