import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DeviceMockup from "./DeviceMockup";
import Reveal from "./Reveal";

function FloatingProductCard({ product, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.18 + index * 0.12 }}
      whileHover={{ y: -8 }}
      className="surface-card relative overflow-hidden p-5"
      style={{ background: product.theme.surface }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
            {product.name}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-ink">{product.heroHeadline}</h3>
        </div>
        <div
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: product.theme.chipBg,
            color: product.theme.chipText
          }}
        >
          {product.homePrice}
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-[1fr,120px] sm:items-center">
        <p className="text-sm leading-6 text-smoke">{product.homeDescription}</p>
        <DeviceMockup
          type={product.theme.mockup}
          accent={product.theme.accent}
          accentSoft={product.theme.accentSoft}
          className="aspect-square"
          floating
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-smoke">
        {product.targetSegments.slice(0, 2).map((segment) => (
          <span
            key={segment}
            className="rounded-full border border-white/70 bg-white/65 px-3 py-1"
          >
            {segment}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

export default function HeroSection({ products }) {
  return (
    <section className="overflow-hidden py-14 sm:py-18 lg:py-24">
      <div className="section-shell">
        <Reveal className="max-w-4xl">
          <p className="eyebrow">A modern wearable ecosystem</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
            Wear your data. Live smarter.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-smoke sm:text-xl">
            PulseWear helps you understand your health, performance, and focus
            with smart devices designed for every lifestyle.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/#products"
              className="rounded-full bg-accent px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-accentDeep hover:shadow-hover"
            >
              Explore products
            </Link>
            <Link
              to="/#compare"
              className="rounded-full border border-line bg-white px-6 py-3.5 text-center text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:shadow-panel"
            >
              Compare devices
            </Link>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {products.map((product, index) => (
            <FloatingProductCard
              key={product.slug}
              product={product}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
