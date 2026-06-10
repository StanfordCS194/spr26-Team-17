import { isOpenSiteSlug } from '@showcase/shared';

export type SiteBrand = 'youtube' | 'amazon' | 'instagram' | 'slack' | 'generic';

const SLUG_TO_BRAND: Record<string, SiteBrand> = {
  'youtube-clone': 'youtube',
  'amazon-storefront': 'amazon',
  'instagram-feed': 'instagram',
  'slack-workspace': 'slack',
};

export function getSiteBrand(slug: string): SiteBrand {
  // Dynamically-opened URL tabs render with neutral, site-themed chrome.
  if (isOpenSiteSlug(slug)) return 'generic';
  return SLUG_TO_BRAND[slug] ?? 'youtube';
}
