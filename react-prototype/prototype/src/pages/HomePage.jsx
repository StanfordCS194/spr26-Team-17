import CTASection from "../components/CTASection";
import ComparisonTable from "../components/ComparisonTable";
import HeroSection from "../components/HeroSection";
import PricingCard from "../components/PricingCard";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import SegmentCard from "../components/SegmentCard";
import { audienceSegments, comparisonRows, productCatalog } from "../data/siteData";

export default function HomePage() {
  return (
    <>
      <HeroSection products={productCatalog} />

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
            {productCatalog.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
              />
            ))}
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
            <ComparisonTable rows={comparisonRows} />
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
              Premium devices, clear starting points.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {productCatalog.map((product, index) => (
              <PricingCard
                key={product.slug}
                tier={{
                  tier: product.name,
                  price: product.homePrice.replace("From ", ""),
                  note: product.homeDescription
                }}
                theme={product.theme}
                featured={index === 1}
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Start with the device that fits your rhythm."
        buttonLabel="Compare all devices"
        buttonHref="/#compare"
      />
    </>
  );
}
