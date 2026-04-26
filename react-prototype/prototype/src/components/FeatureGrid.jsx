import { motion } from "framer-motion";

export default function FeatureGrid({ features, theme }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => (
        <motion.div
          key={feature}
          whileHover={{ y: -5 }}
          className="surface-card p-5"
          style={{
            background: `linear-gradient(180deg, white, ${theme.panelTint})`
          }}
        >
          <div
            className="mb-4 h-2 w-16 rounded-full"
            style={{ background: theme.accent }}
          />
          <div className="text-base font-semibold text-ink">{feature}</div>
          <p className="mt-2 text-sm leading-6 text-smoke">
            Designed to keep {feature.toLowerCase()} readable at a glance,
            without turning your day into a dashboard.
          </p>
        </motion.div>
      ))}
    </div>
  );
}
