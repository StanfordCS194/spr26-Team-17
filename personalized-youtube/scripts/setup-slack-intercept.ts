/**
 * Diagnose Slack intercept auth and print setup steps.
 * Run: pnpm slack:setup
 */

import { readSlackCookies } from '../apps/web/lib/innertube/chrome-cookies';
import { readSlackXoxcFromChrome } from '../apps/web/lib/slack/chrome-xoxc';
import { getSlackBootstrap } from '../apps/web/lib/slack/client';

async function main() {
  console.log('--- Slack intercept setup ---\n');

  const envToken = process.env.SLACK_XOXC?.trim() || process.env.SLACK_XOXP?.trim();
  if (envToken) {
    console.log('✓ SLACK_XOXC or SLACK_XOXP found in .env');
  } else {
    console.log('✗ SLACK_XOXC not in .env');
    const fromChrome = await readSlackXoxcFromChrome();
    if (fromChrome) {
      console.log('✓ Found xoxc token in Chrome profile storage (will auto-use)');
    } else {
      console.log('✗ No xoxc token in Chrome profile storage');
      console.log('\nTo connect your real workspace:');
      console.log('  1. Open https://app.slack.com in Chrome Profile 1 (same as CHROME_COOKIE_PATH)');
      console.log('  2. DevTools → Console, run:');
      console.log(
        '     JSON.parse(localStorage.localConfig_v2).teams[document.location.pathname.match(/^\\/client\\/([A-Z0-9]+)/)[1]].token',
      );
      console.log('  3. Add to .env:  SLACK_XOXC=xoxc-…');
      console.log('  4. Re-run: pnpm slack:setup && pnpm check:feeds');
    }
  }

  const cookies = await readSlackCookies();
  if (cookies.kind === 'ok') {
    const hasD = cookies.cookies.some((c) => c.name === 'd');
    console.log(`\n✓ Chrome cookies: ${cookies.cookies.length} for slack (${hasD ? 'd cookie present' : 'd cookie MISSING — log in at app.slack.com'})`);
  } else {
    console.log(`\n✗ Chrome cookies: ${cookies.reason}`);
  }

  console.log('\n--- Live API smoke test ---');
  const boot = await getSlackBootstrap();
  if (boot.kind === 'ok') {
    console.log(`✓ Workspace: ${boot.meta.workspaceName}`);
    console.log(`  Channels: ${boot.meta.channels.length}  DMs: ${boot.meta.dms.length}`);
    console.log(`  Default: ${boot.meta.defaultChannelLabel}`);
  } else {
    console.log(`✗ ${boot.reason}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
