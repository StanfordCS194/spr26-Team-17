/** Showcase surfaces the chat can navigate between. */
export const SHOWCASE_SITES = [
  { id: 'youtube', slug: 'youtube-clone', label: 'YouTube', path: '/' },
  { id: 'amazon', slug: 'amazon-storefront', label: 'Amazon', path: '/amazon' },
  { id: 'instagram', slug: 'instagram-feed', label: 'Instagram', path: '/instagram' },
  { id: 'slack', slug: 'slack-workspace', label: 'Slack', path: '/slack' },
] as const;

export type ShowcaseSiteId = (typeof SHOWCASE_SITES)[number]['id'];

export function siteById(id: string) {
  return SHOWCASE_SITES.find((s) => s.id === id);
}

export function siteBySlug(slug: string) {
  return SHOWCASE_SITES.find((s) => s.slug === slug);
}

export function siteByPath(path: string) {
  const p = path === '' ? '/' : path;
  return SHOWCASE_SITES.find((s) => s.path === p);
}
