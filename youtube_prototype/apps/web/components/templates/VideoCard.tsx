'use client';

import { useEffect, useRef, useState } from 'react';
import type { PageConfig, Video } from '@showcase/shared';

const ASPECT_RATIO = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
} as const;

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

export function VideoCard({
  video,
  config,
  watchedFraction,
}: {
  video: Video;
  config: PageConfig;
  watchedFraction?: number;
}) {
  const cardDefaults = config.theme.videoCardDefaults;
  const aspectClass = ASPECT_RATIO[cardDefaults.aspectRatio];
  const [hidden, setHidden] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // If the browser already finished loading (cached) before hydration,
  // onError won't fire again — check naturalWidth on mount to catch broken cached entries.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setHidden(true);
  }, []);

  if (hidden) return null;

  return (
    <article className="group flex flex-col gap-3">
      <div className={`relative overflow-hidden rounded-xl bg-[color:var(--muted)] ${aspectClass}`}>
        <img
          ref={imgRef}
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          onError={() => setHidden(true)}
          className="h-full w-full object-cover"
        />
        {cardDefaults.showDuration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
            {video.duration}
          </span>
        )}
        {typeof watchedFraction === 'number' && watchedFraction > 0 && (
          <span
            className="absolute bottom-0 left-0 h-0.5 bg-[color:var(--accent)]"
            style={{ width: `${Math.min(100, Math.max(0, watchedFraction * 100))}%` }}
          />
        )}
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[color:var(--muted)]">
          {video.channel.avatar && (
            <img
              src={video.channel.avatar}
              alt=""
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <h3
            className="line-clamp-2 text-sm leading-snug"
            style={{ fontWeight: cardDefaults.titleWeight }}
          >
            {video.title}
          </h3>
          <p
            className="mt-1 truncate text-xs text-[color:var(--muted-fg)]"
            style={{ fontWeight: cardDefaults.channelNameWeight }}
          >
            {video.channel.name}
            {video.channel.verified && <span className="ml-1">✓</span>}
          </p>
          {(cardDefaults.showViewCount || cardDefaults.showPostedAgo) && (
            <p className="mt-0.5 text-xs text-[color:var(--muted-fg)]">
              {cardDefaults.showViewCount && `${formatViews(video.views)} views`}
              {cardDefaults.showViewCount && cardDefaults.showPostedAgo && ' · '}
              {cardDefaults.showPostedAgo && video.postedAgo}
            </p>
          )}
          {cardDefaults.showDescription && video.description && (
            <p className="mt-1 line-clamp-2 text-xs text-[color:var(--muted-fg)]">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
