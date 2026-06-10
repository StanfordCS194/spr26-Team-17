/**
 * Partner-friendly launch: auto-detect Chrome Slack session, wire .env, open /slack in Chrome.
 *
 * Each teammate runs locally with their own Chrome profile + .env (gitignored).
 * Run: pnpm launch:slack
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSlackCookies } from '../apps/web/lib/innertube/chrome-cookies';
import { readSlackXoxcFromChrome } from '../apps/web/lib/slack/chrome-xoxc';
import { getSlackBootstrap, resetSlackClientCache } from '../apps/web/lib/slack/client';
import {
  cookiePathForProfile,
  listChromeProfiles,
  openInChrome,
  profileFromCookiePath,
  readEnvCookiePath,
  startDevServerInBackground,
  waitForDevServer,
} from './lib/chrome-profile';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(SCRIPT_DIR, '../.env');
const SLACK_APP = 'https://app.slack.com/client';
const SLACK_LOCAL = 'http://localhost:3000/slack';

function upsertEnv(cookiePath: string, token: string): void {
  let env = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : '';
  env = env.replace(/^SLACK_XOXC=.*\n/m, '');
  env = env.replace(/^SLACK_XOXP=.*\n/m, '');

  if (/^CHROME_COOKIE_PATH=/m.test(env)) {
    env = env.replace(/^CHROME_COOKIE_PATH=.*$/m, `CHROME_COOKIE_PATH="${cookiePath}"`);
  } else {
    env += `\nCHROME_COOKIE_PATH="${cookiePath}"\n`;
  }

  if (!env.endsWith('\n')) env += '\n';
  env += `SLACK_XOXC=${token}\n`;
  writeFileSync(ENV_PATH, env);
}

async function tryBootstrap(cookiePath: string): Promise<
  | { kind: 'ok'; workspaceName: string }
  | { kind: 'fail'; reason: string }
> {
  process.env.CHROME_COOKIE_PATH = cookiePath;
  delete process.env.SLACK_XOXC;
  delete process.env.SLACK_XOXP;
  resetSlackClientCache();

  const token = await readSlackXoxcFromChrome();
  if (!token) return { kind: 'fail', reason: 'no xoxc token' };

  process.env.SLACK_XOXC = token;
  const boot = await getSlackBootstrap();
  if (boot.kind !== 'ok') return { kind: 'fail', reason: boot.reason };
  return { kind: 'ok', workspaceName: boot.meta.workspaceName };
}

async function scoreProfile(profile: string): Promise<number> {
  const cookiePath = cookiePathForProfile(profile);
  process.env.CHROME_COOKIE_PATH = cookiePath;
  const [cookies, xoxc] = await Promise.all([readSlackCookies(), readSlackXoxcFromChrome()]);
  const count = cookies.kind === 'ok' ? cookies.cookies.length : 0;
  const hasD = cookies.kind === 'ok' && cookies.cookies.some((c) => c.name === 'd');
  return count + (hasD ? 50 : 0) + (xoxc ? 100 : 0);
}

async function configureForThisMachine(): Promise<{
  profile: string;
  cookiePath: string;
  live: boolean;
  workspaceName?: string;
}> {
  console.log('Scanning your Chrome profiles for Slack…\n');

  for (const profile of listChromeProfiles()) {
    const cookiePath = cookiePathForProfile(profile);
    const result = await tryBootstrap(cookiePath);
    if (result.kind === 'ok') {
      const token = process.env.SLACK_XOXC!;
      upsertEnv(cookiePath, token);
      console.log(`✓ ${profile}: live — ${result.workspaceName}`);
      return { profile, cookiePath, live: true, workspaceName: result.workspaceName };
    }
    console.log(`  ${profile}: ${result.reason}`);
  }

  // Best-effort: save the profile most likely to work after Slack login
  let best: { profile: string; score: number } | null = null;
  for (const profile of listChromeProfiles()) {
    const score = await scoreProfile(profile);
    if (score > 0 && (!best || score > best.score)) best = { profile, score };
  }

  if (best) {
    const cookiePath = cookiePathForProfile(best.profile);
    process.env.CHROME_COOKIE_PATH = cookiePath;
    const token = await readSlackXoxcFromChrome();
    if (token) {
      upsertEnv(cookiePath, token);
      console.log(`\n→ Saved .env for ${best.profile} (sign in to Slack to go live)`);
      return { profile: best.profile, cookiePath, live: false };
    }
  }

  const fallback = listChromeProfiles()[0] ?? 'Default';
  const cookiePath = cookiePathForProfile(fallback);
  let env = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : '';
  if (!readEnvCookiePath(env)) {
    if (!env.endsWith('\n')) env += '\n';
    env += `CHROME_COOKIE_PATH="${cookiePath}"\n`;
    writeFileSync(ENV_PATH, env);
  }
  console.log(`\n→ No Slack session yet — use ${fallback}, log in at app.slack.com`);
  return { profile: fallback, cookiePath, live: false };
}

async function main() {
  const configured = await configureForThisMachine();

  const ready = await waitForDevServer(3000, 2);
  if (!ready) {
    startDevServerInBackground();
    const up = await waitForDevServer(3000, 45);
    if (!up) {
      console.error('Dev server did not start — run: pnpm --filter @showcase/web dev');
      process.exit(1);
    }
  }

  console.log(`\nOpening Chrome (${configured.profile})…`);
  openInChrome(configured.profile, SLACK_LOCAL);

  if (!configured.live) {
    openInChrome(configured.profile, SLACK_APP);
    console.log('\nSign in to Slack in the Chrome tab that opened, then refresh http://localhost:3000/slack');
    console.log('Or re-run: pnpm launch:slack');
  } else {
    console.log(`\nLive workspace: ${configured.workspaceName}`);
    console.log(SLACK_LOCAL);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
