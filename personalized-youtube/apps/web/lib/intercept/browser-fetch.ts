// Shared fetch helpers for replaying browser-captured API calls (no third-party SDK).

const DEFAULT_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export function browserUserAgent(): string {
  return process.env.SHOWCASE_BROWSER_UA?.trim() || DEFAULT_UA;
}

export function cookieValue(cookies: { name: string; value: string }[], name: string): string | null {
  const hit = cookies.find((c) => c.name === name);
  return hit?.value ?? null;
}

export async function fetchWithSession(
  url: string,
  init: RequestInit & { cookieHeader: string; headers?: Record<string, string> },
): Promise<Response> {
  const { cookieHeader, headers = {}, ...rest } = init;
  return fetch(url, {
    ...rest,
    headers: {
      'User-Agent': browserUserAgent(),
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      Cookie: cookieHeader,
      ...headers,
    },
  });
}
