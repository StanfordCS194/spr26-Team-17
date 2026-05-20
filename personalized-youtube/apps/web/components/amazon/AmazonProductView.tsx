'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Video } from '@showcase/shared';
import { AmazonBuyBox } from '@/components/amazon/AmazonBuyBox';
import { AmazonImageGalleryControlled } from '@/components/amazon/AmazonImageGallery';
import { AmazonPrice } from '@/components/amazon/AmazonPrice';
import { AmazonStars, formatReviewCount, parseAmazonRating } from '@/components/amazon/AmazonStars';
import type { AmazonProductDetail } from '@/lib/amazon/product-detail';
import { dedupeAmazonImages, isUsableProductImage } from '@/lib/amazon/image-utils';
import { useAmazonProductThumb } from '@/lib/amazon/use-product-thumb';
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

function CarouselCard({
  video,
  onSelect,
}: {
  video: Video;
  onSelect: (id: string, title: string, meta?: { thumbnail?: string; price?: string }) => void;
}) {
  const price = video.duration?.startsWith('$') ? video.duration : null;
  const rating = parseAmazonRating(video.postedAgo);
  const thumb = useAmazonProductThumb(video.id, video.thumbnail);

  return (
    <button
      type="button"
      onClick={() =>
        onSelect(video.id, video.title, {
          thumbnail: thumb || video.thumbnail,
          price: video.duration?.startsWith('$') ? video.duration : undefined,
        })
      }
      className="group w-[148px] shrink-0 text-left"
    >
      <div className="flex h-[148px] items-center justify-center overflow-hidden rounded-sm border border-[#e7e7e7] bg-white p-2 transition-shadow group-hover:shadow-md">
        {isUsableProductImage(thumb) ? (
          <img src={thumb} alt={video.title} loading="lazy" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ddd] border-t-[#ff9900]" />
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-[#007185] group-hover:text-[#c7511f] group-hover:underline">
        {video.title}
      </p>
      {rating != null && (
        <div className="mt-1">
          <AmazonStars rating={rating} size="sm" showNumeric={false} />
        </div>
      )}
      {price && <p className="mt-0.5 text-[13px] font-medium text-[#0f1111]">{price}</p>}
    </button>
  );
}

function PrimeInline() {
  return (
    <span className="text-[#00a8e1] font-bold text-[13px]">prime</span>
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
  const { setWatching, watchingThumbnail, watchingPrice } = usePageStore();
  const { addedBanner, clearAddedBanner, goToCart, cartCount } = useAmazonCart();
  const [productState, setProductState] = useState<ProductState>({ status: 'idle' });
  const [reviewsState, setReviewsState] = useState<ReviewsState>({ status: 'idle' });
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const delivery = useMemo(() => deliveryWindow(), [watchingId]);

  const fallbackTitle = watchingTitle || currentVideo?.title || 'Product';
  const fallbackPrice =
    (watchingPrice?.startsWith('$') ? watchingPrice : null) ||
    (currentVideo?.duration?.startsWith('$') ? currentVideo.duration : '') ||
    '';
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
          setProductState({ status: 'error', reason: 'unavailable' });
          return;
        }
        const data = (await r.json()) as { ok?: boolean; product?: AmazonProductDetail };
        if (!data.ok || !data.product) {
          setProductState({ status: 'error', reason: 'unavailable' });
          return;
        }
        setProductState({ status: 'ok', product: data.product });
      })
      .catch(() => {
        if (!cancelled) setProductState({ status: 'error', reason: 'unavailable' });
      });
    return () => { cancelled = true; };
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
        const data = (await r.json()) as { ok?: boolean; reviews?: ReviewsState extends { status: 'ok'; reviews: infer R } ? R : never };
        if (!data.ok || !Array.isArray(data.reviews)) {
          setReviewsState({ status: 'error', reason: 'unavailable' });
          return;
        }
        setReviewsState({ status: 'ok', reviews: data.reviews });
      })
      .catch(() => {
        if (!cancelled) setReviewsState({ status: 'error', reason: 'unavailable' });
      });
    return () => { cancelled = true; };
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
  const gridThumb = currentVideo?.thumbnail || watchingThumbnail || '';
  const liveThumb = useAmazonProductThumb(
    watchingId,
    detail?.images[0] || gridThumb,
  );

  const galleryImages = useMemo(() => {
    const sources = [
      ...(detail?.images ?? []),
      liveThumb,
      gridThumb,
    ].filter(Boolean);
    return dedupeAmazonImages(sources);
  }, [detail?.images, liveThumb, gridThumb]);
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
    <div className="amazon-pdp min-h-full bg-[#eaeded]">
      {addedBanner && (
        <div className="sticky top-[60px] z-20 flex items-center gap-3 border-b border-[#007600]/30 bg-[#232f3e] px-4 py-2 text-[13px] text-white">
          <span className="font-bold text-[#7fda89]">✓ Added to cart</span>
          <span className="truncate text-[#ccc]">{addedBanner}</span>
          <button type="button" onClick={goToCart} className="ml-auto shrink-0 text-[#ff9900] hover:underline">
            Cart ({cartCount})
          </button>
          <button type="button" onClick={clearAddedBanner} className="shrink-0 text-[#999] hover:text-white" aria-label="Dismiss">✕</button>
        </div>
      )}

      <nav className="border-b border-[#ddd] bg-[#f7fafa] px-4 py-1.5 text-[12px] text-[#565959]">
        <div className="amazon-pdp-body mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-2">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumbs.map((crumb, i) => (
              <li key={`${crumb}-${i}`} className="flex items-center gap-1">
                {i > 0 && <span className="text-[#949494]">›</span>}
                <button type="button" className="text-[#007185] hover:text-[#c7511f] hover:underline">{crumb}</button>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => setWatching(null)} className="text-[#007185] hover:text-[#c7511f] hover:underline">
            ← Back to results
          </button>
        </div>
      </nav>

      <div className="amazon-pdp-body mx-auto max-w-[1180px] px-3 py-3 sm:px-4 sm:py-4">
        {/* Main product panel — white card like amazon.com */}
        <section className="amazon-pdp-hero rounded-sm border border-[#ddd] bg-white px-4 py-5 sm:px-6">
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] xl:grid-cols-[minmax(0,40%)_minmax(0,1fr)_260px] xl:gap-6">
            <AmazonImageGalleryControlled
              images={galleryImages}
              title={title}
              activeIndex={activeImage}
              onSelect={setActiveImage}
              onZoom={() => setZoomOpen(true)}
              loading={productState.status === 'loading'}
            />

            <div className="min-w-0">
              <h1 className="amazon-pdp-title text-[22px] font-normal leading-tight text-[#0f1111] sm:text-[24px]">{title}</h1>

              {brand && (
                <p className="mt-1 text-[13px]">
                  by <button type="button" className="text-[#007185] hover:underline">{brand}</button>
                  <span className="text-[#565959]"> · </span>
                  <button type="button" className="text-[#007185] hover:underline">Visit the Store</button>
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 border-b border-[#e7e7e7] pb-3">
                {rating != null && (
                  <>
                    <AmazonStars rating={rating} size="md" />
                    {reviewCount && (
                      <button type="button" className="text-[13px] text-[#007185] hover:underline">
                        {formatReviewCount(reviewCount)} ratings
                      </button>
                    )}
                  </>
                )}
              </div>

              {detail?.amazonChoice && (
                <span className="mt-2 inline-block rounded-sm bg-[#232f3e] px-2 py-0.5 text-[11px] font-bold text-white">
                  Amazon&apos;s <span className="text-[#ff9900]">Choice</span>
                </span>
              )}

              {detail?.boughtPastMonth && (
                <p className="mt-2 text-[13px] text-[#565959]">
                  <span className="font-bold text-[#0f1111]">{detail.boughtPastMonth}+ bought</span> in past month
                </p>
              )}

              {/* Price in center column — hidden on xl where buy box shows it */}
              <div className="mt-3 xl:hidden">
                {price && <AmazonPrice price={price} />}
                {primeEligible && (
                  <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#007185]">
                    <PrimeInline /> Two-Day Delivery · <button type="button" className="hover:underline">FREE Returns</button>
                  </p>
                )}
              </div>

              <div className="mt-4 xl:hidden">
                <AmazonBuyBox {...buyBoxProps} />
              </div>

              {bullets.length > 0 && (
                <div className="mt-5 border-t border-[#e7e7e7] pt-4">
                  <h2 className="mb-2 text-[16px] font-bold text-[#0f1111]">About this item</h2>
                  <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-[#0f1111]">
                    {bullets.map((b) => (
                      <li key={b.slice(0, 48)}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="hidden xl:block">
              <div className="sticky top-[72px]">
                <AmazonBuyBox {...buyBoxProps} />
              </div>
            </div>
          </div>
        </section>

        {suggestions.length > 0 && (
          <section className="mt-4 rounded-sm border border-[#ddd] bg-white px-4 py-4 sm:px-5">
            <h2 className="mb-3 text-[18px] font-bold text-[#0f1111]">Customers who viewed this item also viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {suggestions.slice(0, 12).map((v) => (
                <CarouselCard key={v.id} video={v} onSelect={setWatching} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-4 rounded-sm border border-[#ddd] bg-white px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start gap-8 border-b border-[#e7e7e7] pb-5">
            <div>
              <h2 className="text-[21px] font-bold text-[#0f1111]">Customer reviews</h2>
              {rating != null && (
                <div className="mt-2 flex items-center gap-2">
                  <AmazonStars rating={rating} size="lg" showNumeric={false} />
                  <span className="text-[13px] text-[#565959]">
                    {reviewCount ? `${formatReviewCount(reviewCount)} global ratings` : ''}
                  </span>
                </div>
              )}
            </div>
            {rating != null && (
              <div className="flex items-baseline gap-1">
                <span className="text-[32px] leading-none text-[#0f1111]">{rating.toFixed(1)}</span>
                <span className="text-[13px] text-[#565959]">out of 5</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            {reviewsState.status === 'loading' && <p className="text-[13px] text-[#565959]">Loading reviews…</p>}
            {reviewsState.status === 'error' && (
              <div className="text-[13px] text-[#565959]">
                <p>Couldn&apos;t load reviews right now.</p>
                {rating != null && reviewCount && (
                  <p className="mt-1">Rated {rating.toFixed(1)} · {formatReviewCount(reviewCount)} ratings on Amazon.</p>
                )}
                <a href={`https://www.amazon.com/product-reviews/${encodeURIComponent(watchingId)}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[#007185] hover:underline">
                  See all on Amazon.com →
                </a>
              </div>
            )}
            {reviewsState.status === 'ok' && reviewsState.reviews.length > 0 && (
              <ul className="divide-y divide-[#e7e7e7]">
                {reviewsState.reviews.map((r) => {
                  const rRating = parseAmazonRating(r.rating);
                  return (
                    <li key={r.id} className="py-4 first:pt-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#232f3e] text-[11px] font-bold text-white">
                          {r.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-medium">{r.author}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {rRating != null && <AmazonStars rating={rRating} size="sm" showNumeric={false} />}
                        {r.title && <span className="text-[13px] font-bold">{r.title}</span>}
                      </div>
                      {r.postedAgo && <p className="mt-0.5 text-[12px] text-[#565959]">{r.postedAgo}</p>}
                      <p className="mt-2 text-[14px] leading-relaxed">{r.text}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {zoomOpen && heroImage && (
        <button type="button" aria-label="Close zoom" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6" onClick={() => setZoomOpen(false)}>
          <img src={heroImage} alt={title} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        </button>
      )}
    </div>
  );
}
