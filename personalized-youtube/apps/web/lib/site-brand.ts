export type SiteBrand = 'youtube' | 'amazon' | 'instagram' | 'slack';

const SLUG_TO_BRAND: Record<string, SiteBrand> = {
  'youtube-clone': 'youtube',
  'amazon-storefront': 'amazon',
  'instagram-feed': 'instagram',
  'slack-workspace': 'slack',
};

export function getSiteBrand(slug: string): SiteBrand {
  return SLUG_TO_BRAND[slug] ?? 'youtube';
}
