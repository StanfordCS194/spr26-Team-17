// Best-effort xoxc extraction from Chrome Local Storage (app.slack.com session token).
// Falls back when SLACK_XOXC is not in .env — requires Slack open in the same Chrome profile.

import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { composeCookieHeader, readSlackCookies } from '../innertube/chrome-cookies';
import { cookieValue, fetchWithSession } from '../intercept/browser-fetch';

const XOXC_RE = /xoxc-[A-Za-z0-9\-_]+/g;
/** Real Slack xoxc tokens are much longer than partial leveldb fragments. */
const XOXC_MIN_LEN = 80;

function normalizeToken(raw: string): string | null {
  const m = raw.match(/^xoxc-[A-Za-z0-9\-_]+$/);
  if (!m) return null;
  return m[0].length >= XOXC_MIN_LEN ? m[0] : null;
}

/** Parse team tokens from Chrome localStorage localConfig_v2 blobs in leveldb shards. */
function tokensFromLocalConfig(text: string): string[] {
  const out: string[] = [];
  const marker = 'localConfig_v2';
  let idx = 0;
  while (idx < text.length) {
    const hit = text.indexOf(marker, idx);
    if (hit === -1) break;
    const slice = text.slice(hit, hit + 120_000);
    for (const m of slice.match(XOXC_RE) ?? []) {
      const t = normalizeToken(m);
      if (t) out.push(t);
    }
    idx = hit + marker.length;
  }
  return out;
}

function chromeProfileDir(): string | null {
  const cookiePath = process.env.CHROME_COOKIE_PATH?.trim();
  if (!cookiePath) return null;
  return dirname(cookiePath);
}

async function scanLeveldbDir(dir: string, candidates: Set<string>): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }

  for (const name of entries) {
    if (!name.endsWith('.ldb') && !name.endsWith('.log')) continue;
    try {
      const text = (await readFile(join(dir, name))).toString('latin1');
      for (const t of tokensFromLocalConfig(text)) candidates.add(t);
      for (const m of text.match(XOXC_RE) ?? []) {
        const t = normalizeToken(m);
        if (t) candidates.add(t);
      }
    } catch {
      // skip unreadable leveldb shards
    }
  }
}

async function walkForLeveldb(dir: string, depth: number, candidates: Set<string>): Promise<void> {
  if (depth <= 0) return;
  await scanLeveldbDir(dir, candidates);

  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }

  for (const name of entries) {
    const full = join(dir, name);
    try {
      const info = await stat(full);
      if (!info.isDirectory()) continue;
      await walkForLeveldb(full, depth - 1, candidates);
    } catch {
      // skip
    }
  }
}

async function collectAllXoxcTokens(): Promise<string[]> {
  const profile = chromeProfileDir();
  if (!profile) return [];

  const candidates = new Set<string>();
  const roots = [
    join(profile, 'Local Storage', 'leveldb'),
    join(profile, 'IndexedDB'),
    join(profile, 'Session Storage'),
  ];

  for (const root of roots) {
    await walkForLeveldb(root, 5, candidates);
  }

  return [...candidates];
}

async function testXoxcToken(
  token: string,
  cookieHeader: string,
): Promise<{ ok: boolean; team?: string }> {
  try {
    const res = await fetchWithSession('https://slack.com/api/auth.test', {
      method: 'GET',
      cookieHeader,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const json = (await res.json()) as { ok?: boolean; team?: string; error?: string };
    if (json.ok) return { ok: true, team: json.team };
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

/** Pick a working xoxc token (auth.test ok). Prefers SLACK_WORKSPACE name match. */
async function pickWorkingToken(tokens: string[]): Promise<string | null> {
  if (tokens.length === 0) return null;

  const cookieResult = await readSlackCookies();
  if (cookieResult.kind !== 'ok') {
    return tokens.sort((a, b) => b.length - a.length)[0] ?? null;
  }

  const cookies = cookieResult.cookies;
  const cookieHeader = composeCookieHeader(cookies, 'slack.com');
  if (tokenNeedsCookie(tokens[0]) && !cookieValue(cookies, 'd')) {
    return null;
  }

  const preferred = process.env.SLACK_WORKSPACE?.trim().toLowerCase();
  let fallback: string | null = null;

  for (const token of tokens) {
    const result = await testXoxcToken(token, cookieHeader);
    if (!result.ok) continue;
    if (preferred && result.team?.toLowerCase().includes(preferred)) {
      console.log(`[slack] loaded xoxc for workspace "${result.team}" (count-only)`);
      return token;
    }
    if (!fallback) {
      fallback = token;
      if (!preferred) {
        console.log(`[slack] loaded xoxc for workspace "${result.team}" (count-only)`);
        return token;
      }
    }
  }

  if (fallback) {
    console.log('[slack] loaded xoxc token from Chrome profile storage (count-only)');
  }
  return fallback;
}

function tokenNeedsCookie(token: string): boolean {
  return token.startsWith('xoxc-');
}

/** Scan Chrome profile storage for a working Slack xoxc- session token. */
export async function readSlackXoxcFromChrome(): Promise<string | null> {
  const tokens = await collectAllXoxcTokens();
  return pickWorkingToken(tokens);
}
