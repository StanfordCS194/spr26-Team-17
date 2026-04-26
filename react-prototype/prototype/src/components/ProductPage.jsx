import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CTASection from "./CTASection";
import DeviceMockup from "./DeviceMockup";
import FeatureGrid from "./FeatureGrid";
import PricingCard from "./PricingCard";
import Reveal from "./Reveal";

function SegmentPill({ label }) {
  return (
    <span className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-smoke">
      {label}
    </span>
  );
}

function StatCard({ stat, theme }) {
  return (
    <div
      className="rounded-[20px] border border-white/70 bg-white/85 p-4 shadow-panel"
      style={{ boxShadow: `0 18px 50px -32px ${theme.accent}` }}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
        {stat.label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-ink">{stat.value}</div>
    </div>
  );
}

export default function ProductPage({
  name,
  tagline,
  heroHeadline,
  description,
  storyImage,
  pricing,
  targetSegments,
  features,
  theme,
  ctaText,
  highlightStats
}) {
  return (
    <>
      <section className="overflow-hidden py-14 sm:py-18 lg:py-24">
        <div className="section-shell">
          <Reveal className="max-w-4xl">
            <p className="eyebrow">{name}</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[0.96] text-ink sm:text-6xl lg:text-7xl">
              {heroHeadline}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-smoke sm:text-xl">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#pricing"
                className="rounded-full bg-accent px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                {ctaText}
              </a>
              <Link
                to="/#compare"
                className="rounded-full border border-line bg-white px-6 py-3.5 text-center text-sm font-semibold text-ink transition hover:-translate-y-0.5"
              >
                Compare devices
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {targetSegments.map((segment) => (
                <SegmentPill
                  key={segment}
                  label={segment}
                />
              ))}
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="surface-card mt-14 overflow-hidden p-6 sm:p-8 lg:p-10"
            style={{ background: theme.surface }}
          >
            <div className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
              <figure className="relative min-h-[360px] overflow-hidden rounded-[30px] border border-white/70 shadow-panel sm:min-h-[420px]">
                <img
                  src={storyImage.src}
                  alt={storyImage.alt}
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: storyImage.position ?? "center" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    background: `radial-gradient(circle at top right, ${theme.accent}30, transparent 38%)`
                  }}
                />
                <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
                  <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    {storyImage.badge}
                  </span>
                  <figcaption className="mt-4 max-w-xl text-xl font-medium leading-tight text-white sm:text-[1.7rem]">
                    {storyImage.caption}
                  </figcaption>
                </div>
              </figure>

              <div className="grid gap-4">
                <div
                  className="rounded-[30px] border border-white/70 p-6 shadow-panel backdrop-blur-sm sm:p-8"
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.94), ${theme.panelTint})`
                  }}
                >
                  <div className="grid gap-6 md:grid-cols-[0.92fr,1.08fr] md:items-center">
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.16em]"
                        style={{ color: theme.chipText }}
                      >
                        Product feel
                      </p>
                      <p className="mt-4 max-w-md text-base leading-7 text-ink/75">
                        {tagline} Built to feel premium in motion, clear at a glance,
                        and calm enough to fit into a real day.
                      </p>
                    </div>

                    <div className="mx-auto flex w-full max-w-[260px] justify-center sm:max-w-[300px]">
                      <DeviceMockup
                        type={theme.mockup}
                        accent={theme.accent}
                        accentSoft={theme.accentSoft}
                        className="aspect-square w-full"
                        floating
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {highlightStats.map((stat) => (
                    <StatCard
                      key={stat.label}
                      stat={stat}
                      theme={theme}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-shell">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">Feature set</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
              A cleaner interface for your body, schedule, and habits.
            </h2>
          </Reveal>

          <div className="mt-10">
            <FeatureGrid
              features={features}
              theme={theme}
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
              Pick the setup that matches your pace.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {pricing.map((tier, index) => (
              <PricingCard
                key={tier.tier}
                tier={tier}
                theme={theme}
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
        secondaryLabel="Back to home"
        secondaryHref="/"
      />
    </>
  );
}
