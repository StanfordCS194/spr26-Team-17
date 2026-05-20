'use client';

import { useState } from 'react';

export function AmazonImageGallery({
  images,
  title,
  onZoom,
}: {
  images: string[];
  title: string;
  onZoom?: () => void;
}) {
  const [active, setActive] = useState(0);
  const hero = images[active] ?? images[0] ?? '';

  if (!hero) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded border border-[#ddd] bg-white text-sm text-[#565959] sm:h-[420px]">
        No image
      </div>
    );
  }

  return (
    <div className="amazon-gallery">
      <button
        type="button"
        onClick={onZoom}
        className="flex h-[300px] w-full items-center justify-center bg-white p-4 sm:h-[400px]"
        aria-label="Zoom product image"
      >
        <img src={hero} alt={title} className="max-h-full max-w-full object-contain" />
      </button>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border bg-white p-0.5 sm:h-14 sm:w-14 ${
                active === i ? 'border-[#007185] shadow-[0_0_0_1px_#007185]' : 'border-[#ccc] hover:border-[#888]'
              }`}
            >
              <img src={src} alt="" className="max-h-full max-w-full object-contain" />
            </button>
          ))}
        </div>
      )}

      <p className="mt-1 text-center text-[11px] text-[#565959]">Click image to zoom</p>
    </div>
  );
}

/** Controlled gallery when parent owns active index */
export function AmazonImageGalleryControlled({
  images,
  title,
  activeIndex,
  onSelect,
  onZoom,
  loading = false,
}: {
  images: string[];
  title: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  onZoom?: () => void;
  loading?: boolean;
}) {
  const hero = images[activeIndex] ?? images[0] ?? '';

  if (!hero) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-2 bg-white text-sm text-[#565959] sm:h-[420px]">
        {loading ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ddd] border-t-[#ff9900]" />
            Loading product image…
          </>
        ) : (
          'Image unavailable'
        )}
      </div>
    );
  }

  return (
    <div className="amazon-gallery">
      <button
        type="button"
        onClick={onZoom}
        className="flex h-[300px] w-full items-center justify-center bg-white p-4 sm:h-[400px]"
        aria-label="Zoom product image"
      >
        <img src={hero} alt={title} className="max-h-full max-w-full object-contain" />
      </button>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onSelect(i)}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border bg-white p-0.5 sm:h-14 sm:w-14 ${
                activeIndex === i ? 'border-[#007185] shadow-[0_0_0_1px_#007185]' : 'border-[#ccc] hover:border-[#888]'
              }`}
            >
              <img src={src} alt="" className="max-h-full max-w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
