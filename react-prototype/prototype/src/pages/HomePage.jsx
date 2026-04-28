import CTASection from "../components/CTASection";
import ComparisonTable from "../components/ComparisonTable";
import HeroSection from "../components/HeroSection";
import PricingCard from "../components/PricingCard";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import SegmentCard from "../components/SegmentCard";
import { audienceSegments, comparisonRows, productCatalog } from "../data/siteData";

function orderedCatalog(products, personalization) {
  const top = personalization?.topFits?.map((f) => f.slug).filter(Boolean) ?? [];
  const slug =
    personalization?.recommendedSlug ||
    (personalization?.comparisonFocus &&
      products.find((p) => p.name === personalization.comparisonFocus)?.slug);
  const order = top.length ? top : slug ? [slug] : [];

  if (!order.length) return products;

  const seen = new Set();
  const ranked = [];
  for (const s of order) {
    const p = products.find((x) => x.slug === s);
    if (p && !seen.has(s)) {
      seen.add(s);
      ranked.push(p);
    }
  }
  const rest = products.filter((p) => !seen.has(p.slug));
  return [...ranked, ...rest];
}

export default function HomePage({ personalization, productSpotlightSlug }) {
  const orderedProducts = orderedCatalog(productCatalog, personalization);

  const featuredProduct = orderedProducts[0];
  const featuredSegments = personalization?.featuredSegments || [];
  const recommendedProduct = featuredProduct || productCatalog[0];

  return (
    <>
      <HeroSection products={orderedProducts} />

      {personalization ? (
        <section className="pt-10">
          <div className="section-shell">
            <div className="overflow-hidden rounded-[32px] border border-line bg-[linear-gradient(135deg,rgba(84,101,255,0.08),rgba(255,255,255,0.92))] p-6 shadow-panel sm:p-8">
              <p className="eyebrow">AI personalization active</p>
              <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
                    {personalization.heroTitle}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-smoke">
                    {personalization.heroDescription}
                  </p>
                </div>
                <div className="rounded-[26px] border border-black/5 bg-white/90 px-5 py-4 shadow-panel">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
                    Recommended lineup
                  </div>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm font-semibold text-ink">
                    {(personalization.topFits?.length
                      ? personalization.topFits
                      : [
                          {
                            rank: 1,
                            productName: personalization.recommendedProductName,
                            whyItFits: "Primary recommendation from your goals."
                          }
                        ]
                    ).map((fit) => (
                      <li key={`${fit.rank}-${fit.productName}`} className="marker:font-semibold">
                        <span className="text-ink">{fit.productName}</span>
                        {fit.whyItFits ? (
                          <span className="mt-0.5 block text-xs font-normal leading-snug text-smoke">{fit.whyItFits}</span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 text-xs text-smoke">
                    {personalization.focusAudience} • {(personalization.priorities ?? []).join(", ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section
        id="products"
        className="py-20"
      >
        <div className="section-shell">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">Products</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
              Find the device that fits your life.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {orderedProducts.map((product, index) => {
              const fit = personalization?.topFits?.find((f) => f.slug === product.slug);
              const featuredReason = fit
                ? `${fit.productName}: ${fit.whyItFits}`
                : personalization && index === 0
                  ? `Chosen for ${personalization.focusAudience.toLowerCase()} needs with emphasis on ${(personalization.priorities ?? []).join(", ")}.`
                  : "";
              return (
                <ProductCard
                  key={product.slug}
                  product={product}
                  featuredReason={featuredReason}
                  pulseSpotlight={productSpotlightSlug === product.slug}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="segments"
        className="py-20"
      >
        <div className="section-shell">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">Audience segments</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
              Designed for every kind of lifestyle.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {audienceSegments.map((segment, index) => (
              <SegmentCard
                key={segment.title}
                segment={segment}
                index={index}
                highlighted={featuredSegments.includes(segment.title)}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="compare"
        className="py-20"
      >
        <div className="section-shell">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">Comparison preview</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
              See the lineup at a glance.
            </h2>
          </Reveal>

          <div className="mt-10">
            <ComparisonTable
              rows={comparisonRows}
              focusedDevices={
                personalization?.topFits?.length
                  ? personalization.topFits.map((f) => f.productName)
                  : personalization?.comparisonFocus
                    ? [personalization.comparisonFocus]
                    : undefined
              }
            />
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="py-20"
      >
        <div className="section-shell">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">Pricing</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
              {recommendedProduct.name} pricing, tuned to your direction.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {recommendedProduct.pricing.map((tier, index) => (
              <PricingCard
                key={tier.tier}
                tier={tier}
                theme={recommendedProduct.theme}
                featured={index === 1}
                highlightedLabel={
                  personalization?.highlightedPricingTier === tier.tier ? "AI fit" : ""
                }
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title={personalization?.heroTitle || "Start with the device that fits your rhythm."}
        buttonLabel={personalization?.ctaLabel || "Compare all devices"}
        buttonHref={featuredProduct?.route || "/#compare"}
        secondaryLabel="See all devices"
        secondaryHref="/#products"
      />
    </>
  );
}
