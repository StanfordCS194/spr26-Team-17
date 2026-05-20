'use client';

export function parseAmazonRating(raw: string | undefined): number | null {
  if (!raw) return null;
  const m = raw.match(/([0-5](?:\.[0-9])?)/);
  return m?.[1] ? parseFloat(m[1]) : null;
}

export function AmazonStars({
  rating,
  size = 'md',
  showNumeric = true,
}: {
  rating: number | null;
  size?: 'sm' | 'md' | 'lg';
  showNumeric?: boolean;
}) {
  if (rating == null) return null;
  const full = Math.floor(rating);
  const partial = rating - full;
  const empty = 5 - full - (partial >= 0.25 ? 1 : 0);
  const dim =
    size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-sm';

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex" aria-hidden>
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f-${i}`} className={`${dim} fill-[#ffa41c] text-[#ffa41c]`} />
        ))}
        {partial >= 0.25 && (
          <span className="relative inline-block">
            <Star className={`${dim} fill-[#ddd] text-[#ddd]`} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${Math.min(100, partial * 100)}%` }}
            >
              <Star className={`${dim} fill-[#ffa41c] text-[#ffa41c]`} />
            </span>
          </span>
        )}
        {Array.from({ length: Math.max(0, empty) }).map((_, i) => (
          <Star key={`e-${i}`} className={`${dim} fill-[#ddd] text-[#ddd]`} />
        ))}
      </span>
      {showNumeric && (
        <span className={`${textSize} text-[#007185] hover:text-[#c7511f] hover:underline`}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.77l-4.94 2.94.94-5.5-4-3.9 5.53-.8L10 1.5z" />
    </svg>
  );
}

export function formatReviewCount(count: string | number | undefined): string {
  if (!count) return '';
  const n = typeof count === 'string' ? parseInt(count.replace(/\D/g, ''), 10) : count;
  if (!n || Number.isNaN(n)) return '';
  return n.toLocaleString('en-US');
}
