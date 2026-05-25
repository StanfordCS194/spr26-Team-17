import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readSlackCookies } from '../apps/web/lib/innertube/chrome-cookies';
import { readSlackXoxcFromChrome } from '../apps/web/lib/slack/chrome-xoxc';

const base = join(process.env.HOME!, 'Library/Application Support/Google/Chrome');
const profiles = ['Default', ...Array.from({ length: 11 }, (_, i) => `Profile ${i + 1}`)];

async function main() {
  console.log('Scanning Chrome profiles for Slack auth...\n');
  let found = false;

  for (const profile of profiles) {
    const cookiePath = join(base, profile, 'Cookies');
    if (!existsSync(cookiePath)) continue;

    process.env.CHROME_COOKIE_PATH = cookiePath;
    const cookies = await readSlackCookies();
    const xoxc = await readSlackXoxcFromChrome();
    const count = cookies.kind === 'ok' ? cookies.cookies.length : 0;
    const hasD = cookies.kind === 'ok' && cookies.cookies.some((c) => c.name === 'd');

    if (count > 0 || xoxc) {
      found = true;
      console.log(
        `${profile.padEnd(12)} cookies:${String(count).padStart(3)}  d:${hasD ? 'Y' : 'n'}  xoxc:${xoxc ? 'found' : 'none'}`,
      );
    }
  }

  if (!found) {
    console.log('No Slack cookies or xoxc tokens found in any Chrome profile.');
    console.log('Log in at https://app.slack.com in Chrome, then re-run this script.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
