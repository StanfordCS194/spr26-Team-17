'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Video } from '@showcase/shared';
import { AmazonBuyBox } from '@/components/amazon/AmazonBuyBox';
import { AmazonStars, formatReviewCount, parseAmazonRating } from '@/components/amazon/AmazonStars';
import type { AmazonProductDetail } from '@/lib/amazon/product-detail';
import { dedupeAmazonImages } from '@/lib/amazon/image-utils';
import { amazonProductHref } from '@/lib/amazon/href';
import { useAmazonCart } from '@/lib/amazon-cart';
import { usePageStore } from '@/lib/store';

type ReviewsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; reviews: Array<{ id: string; author: string; rating: string; title: string; text: string; postedAgo: string }> }
  | { status: 'error'; reason: string };

type ProductState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; product: AmazonProductDetail }
  | { status: 'error'; reason: string };

function deliveryWindow(): { day: string; cutoff: string } {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const day = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const mins = 26 + Math.floor(Math.random() * 40);
  return { day, cutoff: `${mins} mins` };
}

function SuggestionCard({ video, onSelect }: { video: Video; onSelect: (id: string, title: string) => void }) {
  const price = video.duration?.startsWith('$') ? video.duration : null;
  const rating = parseAmazonRating(video.postedAgo);

  return (
    <button
      type="button"
      onClick={() => onSelect(video.id, video.title)}
      className="flex w-full gap-2 rounded-sm p-1 text-left transition-colors hover:bg-[#f7fafa]"
    >
      <div className="relative h-[115px] w-[115px] shrink-0 overflow-hidden rounded-sm border border-[#ddd] bg-white">
        {video.thumbnail && (
          <img src={video.thumbnail} alt={video.title} loading="lazy" className="h-full w-full object-contain p-1" />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="line-clamp-3 text-[13px] leading-snug text-[#007185] hover:text-[#c7511f] hover:underline">
          {video.title}
        </h4>
        {rating != null && (
          <div className="mt-1">
            <AmazonStars rating={rating} size="sm" showNumeric={false} />
          </div>
        )}
        {price && <p className="mt-1 text-[13px] text-[#0f1111]">{price}</p>}
      </div>
    </button>
  );
}

function PrimeMark({ className = 'h-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 54 16" className={className} aria-label="Prime">
      <text x="0" y="12" fill="#00a8e1" fontSize="13" fontWeight="700" fontFamily="Arial,sans-serif">
        prime
      </text>
    </svg>
  );
}

export function AmazonProductView({
  currentVideo,
  suggestions,
  watchingTitle,
  watchingId,
}: {
  currentVideo: Video | undefined;
  suggestions: Video[];
  watchingTitle: string | null;
  watchingId: string;
}) {
  const { setWatching } = usePageStore();
  const { addedBanner, clearAddedBanner, goToCart, cartCount } = useAmazonCart();
  const [productState, setProductState] = useState<ProductState>({ status: 'idle' });
  const [reviewsState, setReviewsState] = useState<ReviewsState>({ status: 'idle' });
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const delivery = useMemo(() => deliveryWindow(), [watchingId]);

  const fallbackTitle = watchingTitle || currentVideo?.title || 'Product';
  const fallbackPrice = currentVideo?.duration?.startsWith('$') ? currentVideo.duration : '';
  const fallbackRating = parseAmazonRating(currentVideo?.postedAgo);
  const productUrl = currentVideo ? amazonProductHref(currentVideo) : '#';

  useEffect(() => {
    let cancelled = false;
    setProductState({ status: 'loading' });
    setActiveImage(0);
    setZoomOpen(false);
    fetch(`/api/amazon/product?asin=${encodeURIComponent(watchingId)}`)
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) {
          const data = (await r.json().catch(() => ({}))) as { reason?: string };
          setProductState({ status: 'error', reason: data.reason ?? `HTTP ${r.status}` });
          return;
        }
        const data = (await r.json()) as { ok?: boolean; product?: AmazonProductDetail };
        if (!data.ok || !data.product) {
          setProductState({ status: 'error', reason: 'product unavailable' });
          return;
        }
        setProductState({ status: 'ok', product: data.product });
      })
      .catch((err) => {
        if (!cancelled) setProductState({ status: 'error', reason: (err as Error).message });
      });
    return () => {
      cancelled = true;
    };
  }, [watchingId]);

  useEffect(() => {
    let cancelled = false;
    setReviewsState({ status: 'loading' });
    fetch(`/api/amazon/reviews?asin=${encodeURIComponent(watchingId)}`)
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) {
          setReviewsState({ status: 'error', reason: 'unavailable' });
          return;
        }
        const data = (await r.json()) as {
          ok?: boolean;
          reviews?: ReviewsState extends { status: 'ok'; reviews: infer R } ? R : never;
        };
        if (!data.ok || !Array.isArray(data.reviews)) {
          setReviewsState({ status: 'error', reason: 'unavailable' });
          return;
        }
        setReviewsState({ status: 'ok', reviews: data.reviews });
      })
      .catch(() => {
        if (!cancelled) setReviewsState({ status: 'error', reason: 'unavailable' });
      });
    return () => {
      cancelled = true;
    };
  }, [watchingId]);

  useEffect(() => {
    if (!addedBanner) return;
    const t = window.setTimeout(clearAddedBanner, 5000);
    return () => window.clearTimeout(t);
  }, [addedBanner, clearAddedBanner]);

  const detail = productState.status === 'ok' ? productState.product : null;
  const title = detail?.title ?? fallbackTitle;
  const price = detail?.price || fallbackPrice;
  const rating = detail?.rating ?? fallbackRating;
  const reviewCount = detail?.reviewCount ?? '';
  const brand = detail?.brand ?? '';
  const galleryImages = useMemo(() => {
    const raw = detail?.images.length ? detail.images : currentVideo?.thumbnail ? [currentVideo.thumbnail] : [];
    return dedupeAmazonImages(raw);
  }, [detail?.images, currentVideo?.thumbnail]);
  const heroImage = galleryImages[activeImage] ?? galleryImages[0] ?? '';
  const bullets = detail?.bullets ?? [];
  const breadcrumbs = detail?.breadcrumbs ?? ['All'];
  const inStock = detail?.inStock ?? true;
  const primeEligible = detail?.primeEligible ?? true;

  const buyBoxProps = {
    asin: watchingId,
    title,
    thumbnail: heroImage,
    price,
    inStock,
    primeEligible,
    delivery,
    productUrl,
  };

  return (
    <div className="amazon-pdp bg-[#eaeded] min-h-full">
      {addedBanner && (
        <div className="sticky top-[96px] z-20 border-b border-[#007600] bg-[#232f3e] px-4 py-2 text-sm text-white">
          <span className="text-[#7fda89] font-bold">✓ Added to cart</span>
          <span className="mx-2 text-[#ccc]">—</span>
          <span className="text-[#ccc]">{addedBanner}</span>
          <button
            type="button"
            onClick={goToCart}
            className="ml-4 text-[#ff9900] hover:underline"
          >
            Cart ({cartCount})
          </button>
          <button type="button" onClick={clearAddedBanner} className="ml-4 text-[#ccc] hover:text-white">
            ✕
          </button>
        </div>
      )}

      <nav className="border-b border-[#ddd] bg-white px-4 py-2 text-[12px] text-[#565959]">
        <ol className="flex flex-wrap items-center gap-1">
          {breadcrumbs.map((crumb, i) => (
            <li key={`${crumb}-${i}`} className="flex items-center gap-1">
              {i > 0 && <span>›</span>}
              <button type="button" className="text-[#007185] hover:text-[#c7511f] hover:underline">
                {crumb}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mx-auto max-w-[1500px] px-4 py-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)_300px]">
          {/* Image gallery — only distinct views, not zoom duplicates */}
          <div className="flex gap-3">
            {galleryImages.length > 1 && (
              <ul className="flex shrink-0 flex-col gap-2">
                {galleryImages.map((src, i) => (
                  <li key={src}>
                    <button
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-sm border bg-white p-0.5 ${
                        activeImage === i ? 'border-[#007185] shadow-[0_0_0_1px_#007185]' : 'border-[#ddd]'
                      }`}
                    >
                      <img src={src} alt="" className="max-h-full max-w-full object-contain" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="relative flex min-h-[380px] flex-1 items-center justify-center rounded-sm border border-[#ddd] bg-white p-4">
              {heroImage ? (
                <button type="button" onClick={() => setZoomOpen(true)} className="max-h-[480px] max-w-full">
                  <img src={heroImage} alt={title} className="max-h-[480px] max-w-full object-contain" />
                </button>
              ) : (
                <div className="text-sm text-[#565959]">No image</div>
              )}
              {heroImage && (
                <span className="absolute bottom-3 left-3 text-[12px] text-[#007185]">
                  Roll over image to zoom in
                </span>
              )}
            </div>
          </div>

          {/* Product info + mobile buy box */}
          <div className="min-w-0">
            <h1 className="text-[24px] font-normal leading-snug text-[#0f1111]">{title}</h1>

            {brand && (
              <p className="mt-1 text-[13px]">
                Visit the{' '}
                <button type="button" className="text-[#007185] hover:text-[#c7511f] hover:underline">
                  {brand} Store
                </button>
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              {rating != null && (
                <>
                  <AmazonStars rating={rating} size="md" />
                  {reviewCount && (
                    <button type="button" className="text-[13px] text-[#007185] hover:text-[#c7511f] hover:underline">
                      {formatReviewCount(reviewCount)} ratings
                    </button>
                  )}
                </>
              )}
              <span className="text-[13px] text-[#565959]">|</span>
              <button type="button" className="text-[13px] text-[#007185] hover:underline">
                Search this page
              </button>
            </div>

            {detail?.amazonChoice && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-sm bg-[#232f3e] px-2 py-1 text-[12px] text-white">
                <span className="font-bold">Amazon&apos;s</span>
                <span className="text-[#ff9900]">Choice</span>
              </div>
            )}

            {detail?.boughtPastMonth && (
              <p className="mt-2 text-[13px] text-[#565959]">
                <span className="font-bold text-[#0f1111]">{detail.boughtPastMonth}+ bought</span> in past month
              </p>
            )}

            <hr className="my-3 border-[#e7e7e7]" />

            {price && (
              <div className="flex items-end gap-0.5">
                <span className="text-[13px] text-[#565959] mb-1">$</span>
                <span className="text-[28px] leading-none text-[#0f1111]">{price.replace('$', '').split('.')[0]}</span>
                <span className="text-[13px] text-[#0f1111] mb-0.5">{price.includes('.') ? price.split('.')[1] : '00'}</span>
              </div>
            )}

            {primeEligible && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                <PrimeMark />
                <span className="text-[#007185]">
                  Two-Day Delivery <span className="text-[#565959]">·</span>{' '}
                  <button type="button" className="hover:underline">FREE Returns</button>
                </span>
              </div>
            )}

            {/* Buy box visible on tablet/mobile — desktop uses right column */}
            <div className="mt-4 lg:hidden">
              <AmazonBuyBox {...buyBoxProps} />
            </div>

            {bullets.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2 text-base font-bold text-[#0f1111]">About this item</h2>
                <ul className="list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-[#0f1111]">
                  {bullets.map((b) => (
                    <li key={b.slice(0, 40)}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setWatching(null)}
              className="mt-6 text-[13px] text-[#007185] hover:text-[#c7511f] hover:underline"
            >
              ← Back to results
            </button>
          </div>

          {/* Desktop buy box + suggestions */}
          <div className="hidden flex-col gap-4 lg:flex">
            <AmazonBuyBox {...buyBoxProps} />

            {suggestions.length > 0 && (
              <div className="rounded-lg border border-[#d5d9d9] bg-white p-4">
                <h2 className="mb-3 text-[15px] font-bold text-[#0f1111]">Customers who viewed this item also viewed</h2>
                <div className="flex flex-col gap-3">
                  {suggestions.slice(0, 6).map((v) => (
                    <SuggestionCard key={v.id} video={v} onSelect={setWatching} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-8 rounded-lg border border-[#d5d9d9] bg-white p-6">
          <div className="mb-6 flex flex-wrap items-end gap-6 border-b border-[#e7e7e7] pb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0f1111]">Customer reviews</h2>
              {rating != null && (
                <div className="mt-2 flex items-center gap-3">
                  <AmazonStars rating={rating} size="lg" />
                  <span className="text-[13px] text-[#565959]">
                    {reviewCount ? `${formatReviewCount(reviewCount)} global ratings` : 'Ratings from customers'}
                  </span>
                </div>
              )}
            </div>
            {rating != null && (
              <div className="flex items-center gap-2">
                <span className="text-4xl font-normal text-[#0f1111]">{rating.toFixed(1)}</span>
                <span className="text-[13px] text-[#565959]">out of 5</span>
              </div>
            )}
          </div>

          {reviewsState.status === 'loading' && <p className="text-sm text-[#565959]">Loading reviews…</p>}
          {reviewsState.status === 'error' && (
            <div className="text-sm text-[#565959]">
              <p>Individual reviews couldn&apos;t be loaded right now.</p>
              {rating != null && reviewCount && (
                <p className="mt-2">
                  This product is rated {rating.toFixed(1)} stars with {formatReviewCount(reviewCount)} ratings on Amazon.
                </p>
              )}
              <a
                href={`https://www.amazon.com/product-reviews/${encodeURIComponent(watchingId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-[#007185] hover:underline"
              >
                See all reviews on Amazon.com →
              </a>
            </div>
          )}
          {reviewsState.status === 'ok' && reviewsState.reviews.length === 0 && (
            <p className="text-sm text-[#565959]">No written reviews yet.</p>
          )}
          {reviewsState.status === 'ok' && reviewsState.reviews.length > 0 && (
            <ul className="divide-y divide-[#e7e7e7]">
              {reviewsState.reviews.map((r) => {
                const rRating = parseAmazonRating(r.rating);
                return (
                  <li key={r.id} className="py-5 first:pt-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#232f3e] text-xs font-bold text-white">
                        {r.author.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-medium text-[#0f1111]">{r.author}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {rRating != null && <AmazonStars rating={rRating} size="sm" showNumeric={false} />}
                      {r.title && <span className="text-[13px] font-bold text-[#0f1111]">{r.title}</span>}
                    </div>
                    {r.postedAgo && <p className="mt-1 text-[12px] text-[#565959]">Reviewed {r.postedAgo}</p>}
                    <p className="mt-2 text-[14px] leading-relaxed text-[#0f1111]">{r.text}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {zoomOpen && heroImage && (
        <button
          type="button"
          aria-label="Close zoom"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
          onClick={() => setZoomOpen(false)}
        >
          <img src={heroImage} alt={title} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        </button>
      )}
    </div>
  );
}
