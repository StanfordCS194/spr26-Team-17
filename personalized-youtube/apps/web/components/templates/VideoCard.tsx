'use client';

import { useEffect, useRef, useState } from 'react';
import type { PageConfig, Video } from '@showcase/shared';
import { getSiteBrand } from '@/lib/site-brand';
import { usePageStore } from '@/lib/store';
import { Avatar } from './Avatar';

const ASPECT_RATIO = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
} as const;

const HOVER = {
  none: '',
  lift: 'transition-transform duration-200 hover:-translate-y-0.5',
  zoom: 'transition-transform duration-200 hover:scale-[1.02]',
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
  const brand = getSiteBrand(config.slug);
  const aspectClass = ASPECT_RATIO[cardDefaults.aspectRatio];
  const hoverClass = HOVER[cardDefaults.hoverEffect];
  const horizontal = cardDefaults.cardLayout === 'horizontal';
  const saturate = cardDefaults.thumbnailSaturate ?? 1;
  const hideMeta = cardDefaults.hideMeta ?? false;
  const isWatched = video.watched === true;
  const watchedMode = config.filter.showWatchedOverlay && isWatched;
  const [hidden, setHidden] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setHidden(true);
  }, []);

  if (hidden) return null;

  const thumb = (
    <div className={`relative overflow-hidden bg-[color:var(--muted)] ${aspectClass} ${horizontal ? 'w-1/2 shrink-0' : ''} ${brand === 'instagram' || brand === 'amazon' ? 'rounded-sm' : 'rounded-xl'} ${brand === 'amazon' ? 'bg-white' : ''}`}>
      <img
        ref={imgRef}
        src={video.thumbnail}
        alt={video.title}
        loading="lazy"
        onError={() => setHidden(true)}
        className={`h-full w-full ${brand === 'amazon' ? 'object-contain p-2' : 'object-cover'}`}
        style={saturate !== 1 ? { filter: `saturate(${saturate})` } : undefined}
      />
      {cardDefaults.showDuration && brand !== 'amazon' && (
        <span
          className={`absolute bottom-2 right-2 rounded px-1.5 py-0.5 text-xs ${
            brand === 'instagram'
              ? 'hidden'
              : 'bg-black/80 text-white'
          }`}
        >
          {video.duration}
        </span>
      )}
      {watchedMode && (
        <span className="absolute left-2 top-2 rounded bg-black/85 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/80">
          Watched
        </span>
      )}
      {typeof watchedFraction === 'number' && watchedFraction > 0 && (
        <span
          className="absolute bottom-0 left-0 h-0.5 bg-[color:var(--accent)]"
          style={{ width: `${Math.min(100, Math.max(0, watchedFraction * 100))}%` }}
        />
      )}
    </div>
  );

  const meta = hideMeta ? null : (
    <div className={`flex gap-3 ${horizontal ? 'min-w-0 flex-1 items-start' : brand === 'amazon' ? 'gap-0' : ''}`}>
      {!horizontal && brand === 'youtube' && (
        <Avatar name={video.channel.name} src={video.channel.avatar} size="md" />
      )}
      <div className="min-w-0">
        <h3
          className={`line-clamp-2 leading-snug ${
            horizontal
              ? 'text-base'
              : brand === 'amazon'
                ? 'text-sm font-normal text-[#0f1111] group-hover:text-[#c7511f]'
                : brand === 'instagram'
                  ? 'text-sm font-normal'
                  : 'text-sm'
          }`}
          style={{ fontWeight: brand === 'instagram' ? 400 : cardDefaults.titleWeight }}
        >
          {video.title}
        </h3>
        {brand === 'amazon' && cardDefaults.showDuration && (
          <p className={`mt-1 text-lg font-normal ${video.duration.startsWith('$') ? 'text-[#b12704]' : 'text-[color:var(--muted-fg)] text-sm'}`}>
            {video.duration}
          </p>
        )}
        {brand === 'amazon' && cardDefaults.showPostedAgo && video.postedAgo && (
          <p className="mt-0.5 text-xs text-[#007185]">{video.postedAgo}</p>
        )}
        {brand !== 'amazon' && (
          <p
            className="mt-1 truncate text-xs text-[color:var(--muted-fg)]"
            style={{ fontWeight: cardDefaults.channelNameWeight }}
          >
            {video.channel.name}
            {video.channel.verified && <span className="ml-1">✓</span>}
          </p>
        )}
        {!hideMeta && brand === 'youtube' && (cardDefaults.showViewCount || cardDefaults.showPostedAgo) && (
          <p className="mt-0.5 text-xs text-[color:var(--muted-fg)]">
            {cardDefaults.showViewCount && `${formatViews(video.views)} views`}
            {cardDefaults.showViewCount && cardDefaults.showPostedAgo && ' · '}
            {cardDefaults.showPostedAgo && video.postedAgo}
          </p>
        )}
        {(cardDefaults.showDescription || horizontal) && video.description && (
          <p className="mt-1 line-clamp-2 text-xs text-[color:var(--muted-fg)]">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );

  const { setWatching, youtubeMode } = usePageStore();
  const watchHref =
    brand === 'amazon'
      ? `https://www.amazon.com/dp/${encodeURIComponent(video.id)}`
      : brand === 'instagram'
        ? `https://www.instagram.com/p/${encodeURIComponent(video.id)}/`
        : `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;

  function onCardClick(e: React.MouseEvent): void {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    if (brand === 'youtube' && !youtubeMode) return;
    if (brand === 'youtube') {
      e.preventDefault();
      setWatching(video.id, video.title);
    }
  }

  const watchedDim = watchedMode ? 'opacity-40' : '';

  if (horizontal) {
    return (
      <a
        href={watchHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onCardClick}
        className={`group flex gap-4 cursor-pointer ${hoverClass} ${watchedDim}`}
      >
        {thumb}
        {meta}
      </a>
    );
  }

  return (
    <a
      href={watchHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onCardClick}
      className={`group flex flex-col cursor-pointer ${hoverClass} ${watchedDim} ${hideMeta ? 'gap-0' : brand === 'amazon' ? 'gap-2' : 'gap-3'}`}
    >
      {thumb}
      {meta}
    </a>
  );
}
