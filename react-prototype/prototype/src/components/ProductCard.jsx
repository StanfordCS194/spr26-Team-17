import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DeviceMockup from "./DeviceMockup";

export default function ProductCard({ product, featuredReason }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`surface-card flex h-full flex-col overflow-hidden ${featuredReason ? "ring-2 ring-accent/30" : ""}`}
    >
      <div
        className="p-6"
        style={{ background: product.theme.surface }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            {featuredReason ? (
              <div className="mb-2 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                AI pick
              </div>
            ) : null}
            <div className="text-sm font-semibold text-ink">{product.name}</div>
            <div className="mt-1 text-sm text-smoke">{product.homePrice}</div>
          </div>
          <div
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: product.theme.chipBg,
              color: product.theme.chipText
            }}
          >
            {product.homeUsers}
          </div>
        </div>
        <DeviceMockup
          type={product.theme.mockup}
          accent={product.theme.accent}
          accentSoft={product.theme.accentSoft}
          className="mx-auto mt-6 max-w-[220px]"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl font-semibold">{product.name}</h3>
        <p className="mt-3 text-sm leading-6 text-smoke">{product.homeDescription}</p>
        {featuredReason ? (
          <p className="mt-4 rounded-[20px] bg-accentSoft px-4 py-3 text-sm leading-6 text-ink">
            {featuredReason}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          {product.targetSegments.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full border border-line px-3 py-1 text-xs font-medium text-smoke"
            >
              {item}
            </span>
          ))}
        </div>
        <Link
          to={product.route}
          className="mt-8 inline-flex w-fit rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          View {product.name}
        </Link>
      </div>
    </motion.article>
  );
}
