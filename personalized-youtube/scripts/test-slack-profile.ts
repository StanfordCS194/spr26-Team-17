/**
 * Test Slack bootstrap for one Chrome profile.
 * Usage: CHROME_COOKIE_PATH=... node --import tsx scripts/test-slack-profile.ts
 */

import { readSlackXoxcFromChrome } from '../apps/web/lib/slack/chrome-xoxc';
import { getSlackBootstrap } from '../apps/web/lib/slack/client';

async function main() {
  const token = await readSlackXoxcFromChrome();
  if (!token) {
    console.log('RESULT:no-xoxc');
    return;
  }
  process.env.SLACK_XOXC = token;
  const boot = await getSlackBootstrap();
  if (boot.kind === 'ok') {
    console.log(`RESULT:ok workspace=${boot.meta.workspaceName} channels=${boot.meta.channels.length}`);
  } else {
    console.log(`RESULT:fail reason=${boot.reason}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
