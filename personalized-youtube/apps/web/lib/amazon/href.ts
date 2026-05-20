/** Build a real Amazon product URL from parsed feed data. */
export function amazonProductHref(video: {
  id: string;
  title: string;
  description?: string;
}): string {
  const desc = video.description?.trim() ?? '';
  if (desc.startsWith('https://www.amazon.com/')) {
    return desc.split('?')[0]!;
  }
  // Legacy mock ids from early seeds — search instead of dead /dp/ links.
  if (/^B0MOCK/i.test(video.id)) {
    return `https://www.amazon.com/s?k=${encodeURIComponent(video.title)}`;
  }
  if (!/^[A-Z0-9]{10}$/i.test(video.id)) {
    return `https://www.amazon.com/s?k=${encodeURIComponent(video.title)}`;
  }
  return `https://www.amazon.com/dp/${encodeURIComponent(video.id.toUpperCase())}`;
}
