/** Save best-effort Slack .env from a Chrome profile without requiring live API. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readSlackXoxcFromChrome } from '../apps/web/lib/slack/chrome-xoxc';

async function main() {
  const profile = process.argv[2] ?? 'Profile 9';
  const cookiePath = join(process.env.HOME!, 'Library/Application Support/Google/Chrome', profile, 'Cookies');
  process.env.CHROME_COOKIE_PATH = cookiePath;

  const token = await readSlackXoxcFromChrome();
  if (!token) {
    console.error(`No xoxc token in ${profile}`);
    process.exit(1);
  }

  let env = readFileSync('.env', 'utf8');
  env = env.replace(/^SLACK_XOXC=.*\n/m, '');
  env = env.replace(/^SLACK_XOXP=.*\n/m, '');
  if (/^CHROME_COOKIE_PATH=/m.test(env)) {
    env = env.replace(/^CHROME_COOKIE_PATH=.*$/m, `CHROME_COOKIE_PATH="${cookiePath}"`);
  } else {
    env += `\nCHROME_COOKIE_PATH="${cookiePath}"\n`;
  }
  if (!env.endsWith('\n')) env += '\n';
  env += `SLACK_XOXC=${token}\n`;
  writeFileSync('.env', env);
  console.log(`Saved .env → ${profile} (token not printed)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
