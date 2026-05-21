import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawn } from 'node:child_process';

const CHROME_MAC = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export function chromeBaseDir(): string {
  return join(process.env.HOME!, 'Library/Application Support/Google/Chrome');
}

/** All Chrome profile folder names on this machine (Default + Profile 1…N). */
export function listChromeProfiles(): string[] {
  const base = chromeBaseDir();
  const out: string[] = [];
  if (existsSync(join(base, 'Default', 'Cookies'))) out.push('Default');
  for (let i = 1; i <= 15; i++) {
    const name = `Profile ${i}`;
    if (existsSync(join(base, name, 'Cookies'))) out.push(name);
  }
  return out;
}

export function cookiePathForProfile(profile: string): string {
  return join(chromeBaseDir(), profile, 'Cookies');
}

/** e.g. …/Chrome/Profile 9/Cookies → Profile 9 */
export function profileFromCookiePath(cookiePath: string): string | null {
  const m = cookiePath.match(/\/Chrome\/((?:Default|Profile \d+|System Profile))\//);
  return m?.[1] ?? null;
}

export function readEnvCookiePath(envText: string): string | null {
  const m = envText.match(/^CHROME_COOKIE_PATH="([^"]+)"/m) ?? envText.match(/^CHROME_COOKIE_PATH=([^\n]+)/m);
  return m?.[1]?.trim() ?? null;
}

/** Open URL in Google Chrome using a specific profile directory. */
export function openInChrome(profileDirectory: string, url: string): void {
  if (process.platform === 'darwin') {
    execSync(
      `open -na "Google Chrome" --args --profile-directory="${profileDirectory}" "${url}"`,
      { stdio: 'ignore' },
    );
    return;
  }
  if (existsSync(CHROME_MAC)) {
    spawn(CHROME_MAC, [`--profile-directory=${profileDirectory}`, url], {
      detached: true,
      stdio: 'ignore',
    }).unref();
    return;
  }
  console.warn(`Open manually in Chrome (${profileDirectory}): ${url}`);
}

export async function waitForDevServer(port = 3000, attempts = 30): Promise<boolean> {
  const url = `http://localhost:${port}/slack`;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok || res.status === 502) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

export function startDevServerInBackground(): void {
  const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
  spawn('pnpm', ['--filter', '@showcase/web', 'dev'], {
    cwd: root,
    detached: true,
    stdio: 'ignore',
  }).unref();
  console.log('Starting dev server on http://localhost:3000 …');
}
