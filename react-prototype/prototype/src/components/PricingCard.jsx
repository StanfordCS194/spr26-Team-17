import { motion } from "framer-motion";

export default function PricingCard({ tier, theme, featured = false }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      className={`surface-card h-full p-6 ${featured ? "border-black/15" : ""}`}
      style={{
        background: featured
          ? `linear-gradient(180deg, white, ${theme.panelTint})`
          : "white"
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-smoke">
            {tier.tier}
          </div>
          <div className="mt-3 text-4xl font-semibold text-ink">{tier.price}</div>
        </div>
        {featured ? (
          <div
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: theme.chipBg, color: theme.chipText }}
          >
            Popular
          </div>
        ) : null}
      </div>
      <p className="mt-5 text-sm leading-6 text-smoke">{tier.note}</p>
      <button
        type="button"
        className="mt-8 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
      >
        Select plan
      </button>
    </motion.article>
  );
}
