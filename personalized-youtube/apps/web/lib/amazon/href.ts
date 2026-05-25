/** Build a real Amazon product URL from parsed feed data. */
export function amazonProductHref(video: {
  id: string;
  title: string;
  description?: string;
}): string {
  const asin = video.id.trim().toUpperCase();

  // Legacy mock ids from early seeds — search instead of dead /dp/ links.
  if (/^B0MOCK/i.test(asin)) {
    return `https://www.amazon.com/s?k=${encodeURIComponent(video.title)}`;
  }

  if (/^[A-Z0-9]{10}$/.test(asin)) {
    return `https://www.amazon.com/dp/${encodeURIComponent(asin)}`;
  }

  const desc = video.description?.trim() ?? '';
  if (desc.startsWith('https://www.amazon.com/')) {
    return desc.split('?')[0]!;
  }

  return `https://www.amazon.com/s?k=${encodeURIComponent(video.title)}`;
}
