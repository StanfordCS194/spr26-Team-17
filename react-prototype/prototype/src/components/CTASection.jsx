import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CTASection({ title, buttonLabel, buttonHref, secondaryLabel, secondaryHref }) {
  return (
    <section className="py-20">
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65 }}
          className="surface-card overflow-hidden px-6 py-10 sm:px-10 lg:px-14 lg:py-14"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Get started</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                {title}
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={buttonHref}
                className="rounded-full bg-accent px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-accentDeep"
              >
                {buttonLabel}
              </Link>
              {secondaryLabel ? (
                <Link
                  to={secondaryHref}
                  className="rounded-full border border-line bg-white px-6 py-3.5 text-center text-sm font-semibold text-ink transition hover:-translate-y-0.5"
                >
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
