import { motion } from "framer-motion";

export default function ComparisonTable({ rows }) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="hidden lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-white/70">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
                Device
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
                Best for
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
                Focus
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
                Starting price
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.device}
                className="border-b border-line last:border-b-0"
              >
                <td className="px-6 py-5 text-base font-semibold text-ink">{row.device}</td>
                <td className="px-6 py-5 text-sm leading-6 text-smoke">{row.bestFor}</td>
                <td className="px-6 py-5 text-sm leading-6 text-smoke">{row.focus}</td>
                <td className="px-6 py-5 text-sm font-semibold text-ink">{row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 p-4 lg:hidden">
        {rows.map((row) => (
          <motion.article
            key={row.device}
            whileHover={{ y: -4 }}
            className="rounded-[20px] border border-line bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-ink">{row.device}</div>
                <p className="mt-1 text-sm text-smoke">{row.bestFor}</p>
              </div>
              <div className="text-sm font-semibold text-ink">{row.price}</div>
            </div>
            <div className="mt-4 text-sm leading-6 text-smoke">{row.focus}</div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
