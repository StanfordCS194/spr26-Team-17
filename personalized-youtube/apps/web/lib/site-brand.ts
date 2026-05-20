export type SiteBrand = 'youtube' | 'amazon' | 'instagram';

const SLUG_TO_BRAND: Record<string, SiteBrand> = {
  'youtube-clone': 'youtube',
  'amazon-storefront': 'amazon',
  'instagram-feed': 'instagram',
};

export function getSiteBrand(slug: string): SiteBrand {
  return SLUG_TO_BRAND[slug] ?? 'youtube';
}
