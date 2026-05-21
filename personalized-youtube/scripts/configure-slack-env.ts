/**
 * Auto-configure Slack intercept from Chrome Profile 5 (or first profile with Slack auth).
 * Run: node --env-file=.env --import tsx scripts/configure-slack-env.ts
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readSlackCookies } from '../apps/web/lib/innertube/chrome-cookies';
import { readSlackXoxcFromChrome } from '../apps/web/lib/slack/chrome-xoxc';
import { getSlackBootstrap, resetSlackClientCache } from '../apps/web/lib/slack/client';

const chromeBase = join(process.env.HOME!, 'Library/Application Support/Google/Chrome');
const profiles = ['Profile 9', 'Profile 5', 'Profile 6', 'Profile 1', 'Default'];

async function tryBootstrap(cookiePath: string): Promise<
  | { kind: 'ok'; workspaceName: string; channels: number; defaultLabel: string }
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
  return {
    kind: 'ok',
    workspaceName: boot.meta.workspaceName,
    channels: boot.meta.channels.length,
    defaultLabel: boot.meta.defaultChannelLabel,
  };
}

async function pickProfile(): Promise<{ profile: string; cookiePath: string } | null> {
  for (const profile of profiles) {
    const cookiePath = join(chromeBase, profile, 'Cookies');
    if (!existsSync(cookiePath)) continue;

    const result = await tryBootstrap(cookiePath);
    if (result.kind === 'ok') {
      console.log(`✓ ${profile}: ${result.workspaceName} (${result.channels} channels)`);
      return { profile, cookiePath };
    }
    console.log(`✗ ${profile}: ${result.reason}`);
  }
  return null;
}

function upsertEnv(envPath: string, cookiePath: string, token: string): void {
  let env = readFileSync(envPath, 'utf8');
  env = env.replace(/^SLACK_XOXC=.*\n/m, '');
  env = env.replace(/^SLACK_XOXP=.*\n/m, '');

  if (/^CHROME_COOKIE_PATH=/m.test(env)) {
    env = env.replace(/^CHROME_COOKIE_PATH=.*$/m, `CHROME_COOKIE_PATH="${cookiePath}"`);
  } else {
    env += `\nCHROME_COOKIE_PATH="${cookiePath}"\n`;
  }

  if (!env.endsWith('\n')) env += '\n';
  env += `SLACK_XOXC=${token}\n`;
  writeFileSync(envPath, env);
}

async function main() {
  console.log('Trying Chrome profiles for a working Slack session...\n');
  const picked = await pickProfile();
  if (!picked) {
    console.error('\nNo working Slack session found.');
    console.error('Complete login at https://app.slack.com in Chrome, then re-run: pnpm slack:configure');
    process.exit(1);
  }

  process.env.CHROME_COOKIE_PATH = picked.cookiePath;
  const token = await readSlackXoxcFromChrome();
  if (!token) {
    console.error('Token missing after successful bootstrap — re-run pnpm slack:configure');
    process.exit(1);
  }

  upsertEnv('.env', picked.cookiePath, token);
  console.log(`\n✓ Updated .env — CHROME_COOKIE_PATH → ${picked.profile}`);
  console.log('✓ Added SLACK_XOXC (not printed)');

  const boot = await getSlackBootstrap();
  if (boot.kind !== 'ok') {
    console.error(`✗ Live API failed after save: ${boot.reason}`);
    process.exit(1);
  }

  console.log(`✓ Workspace: ${boot.meta.workspaceName}`);
  console.log(`  Channels: ${boot.meta.channels.length}  DMs: ${boot.meta.dms.length}`);
  console.log(`  Default: ${boot.meta.defaultChannelLabel}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
