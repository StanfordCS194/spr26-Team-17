// Best-effort xoxc extraction from Chrome Local Storage (app.slack.com session token).
// Falls back when SLACK_XOXC is not in .env — requires Slack open in the same Chrome profile.

import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const XOXC_RE = /xoxc-[A-Za-z0-9\-_]+/g;
/** Real Slack xoxc tokens are much longer than partial leveldb fragments. */
const XOXC_MIN_LEN = 80;

function pickBestToken(candidates: Iterable<string>): string | null {
  let best: string | null = null;
  for (const raw of candidates) {
    const m = raw.match(/^xoxc-[A-Za-z0-9\-_]+$/);
    if (!m) continue;
    const token = m[0];
    if (token.length < XOXC_MIN_LEN) continue;
    if (!best || token.length > best.length) best = token;
  }
  return best;
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
      if (m.length >= XOXC_MIN_LEN) out.push(m);
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

async function scanLeveldbDir(dir: string): Promise<string | null> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }

  let best: string | null = null;
  const candidates: string[] = [];
  for (const name of entries) {
    if (!name.endsWith('.ldb') && !name.endsWith('.log')) continue;
    try {
      const buf = await readFile(join(dir, name));
      const text = buf.toString('latin1');
      candidates.push(...tokensFromLocalConfig(text));
      const matches = text.match(XOXC_RE);
      if (matches) candidates.push(...matches);
    } catch {
      // skip unreadable leveldb shards
    }
  }
  best = pickBestToken(candidates);
  return best;
}

async function walkForLeveldb(dir: string, depth: number): Promise<string | null> {
  if (depth <= 0) return null;
  const direct = await scanLeveldbDir(dir);
  if (direct) return direct;

  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }

  for (const name of entries) {
    const full = join(dir, name);
    try {
      const info = await stat(full);
      if (!info.isDirectory()) continue;
      const hit = await walkForLeveldb(full, depth - 1);
      if (hit) return hit;
    } catch {
      // skip
    }
  }
  return null;
}

/** Scan Chrome profile storage for a Slack xoxc- session token. */
export async function readSlackXoxcFromChrome(): Promise<string | null> {
  const profile = chromeProfileDir();
  if (!profile) return null;

  const roots = [
    join(profile, 'Local Storage', 'leveldb'),
    join(profile, 'IndexedDB'),
    join(profile, 'Session Storage'),
  ];

  for (const root of roots) {
    const hit = await walkForLeveldb(root, 5);
    if (hit) {
      console.log('[slack] loaded xoxc token from Chrome profile storage (count-only)');
      return hit;
    }
  }
  return null;
}
