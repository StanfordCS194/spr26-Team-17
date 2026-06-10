export type FeedSource = 'mock' | 'youtube' | 'amazon' | 'instagram' | 'slack';

/** Pick live vs mock adapter for a site slug + env overrides. */
export function resolveFeedSource(slug: string): FeedSource {
  const envRaw = (process.env.SHOWCASE_FEED_SOURCE ?? process.env.FEED_ADAPTER)?.toLowerCase();
  if (envRaw === 'mock') return 'mock';

  // Dedicated routes always use their intercept adapter (unless FEED_ADAPTER=mock).
  if (slug === 'amazon-storefront') return 'amazon';
  if (slug === 'instagram-feed') return 'instagram';
  if (slug === 'slack-workspace') return 'slack';

  // YouTube home: live only when env requests it (preserves existing dev default).
  if (slug === 'youtube-clone') return envRaw === 'youtube' ? 'youtube' : 'mock';

  return 'mock';
}

export function isLiveFeedSource(source: FeedSource): boolean {
  return source === 'youtube' || source === 'amazon' || source === 'instagram' || source === 'slack';
}
