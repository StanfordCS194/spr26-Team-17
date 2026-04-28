import { motion } from "framer-motion";

export default function ComparisonTable({ rows, focusedDevice, focusedDevices }) {
  const focusList =
    Array.isArray(focusedDevices) && focusedDevices.length ? focusedDevices : focusedDevice ? [focusedDevice] : [];

  function rankFor(deviceName) {
    const i = focusList.indexOf(deviceName);
    return i >= 0 ? i : -1;
  }

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
            {rows.map((row) => {
              const rank = rankFor(row.device);
              const isFocused = rank >= 0;
              const badge =
                rank === 0 ? "Top match" : rank > 0 ? "Also fits" : null;
              return (
              <tr
                key={row.device}
                className={`border-b border-line last:border-b-0 ${isFocused ? "bg-[rgba(89,104,255,0.08)]" : ""}`}
              >
                <td className="px-6 py-5 text-base font-semibold text-ink">
                  <div className="flex items-center gap-3">
                    <span>{row.device}</span>
                    {badge ? (
                      <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm leading-6 text-smoke">{row.bestFor}</td>
                <td className="px-6 py-5 text-sm leading-6 text-smoke">{row.focus}</td>
                <td className="px-6 py-5 text-sm font-semibold text-ink">{row.price}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 p-4 lg:hidden">
        {rows.map((row) => {
          const rank = rankFor(row.device);
          const isFocused = rank >= 0;
          const badge =
            rank === 0 ? "Top match" : rank > 0 ? "Also fits" : null;
          return (
          <motion.article
            key={row.device}
            whileHover={{ y: -4 }}
            className={`rounded-[20px] border bg-white p-5 ${isFocused ? "border-accent/30 shadow-[0_20px_45px_-32px_rgba(89,104,255,0.35)]" : "border-line"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-ink">{row.device}</div>
                  {badge ? (
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                      {badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-smoke">{row.bestFor}</p>
              </div>
              <div className="text-sm font-semibold text-ink">{row.price}</div>
            </div>
            <div className="mt-4 text-sm leading-6 text-smoke">{row.focus}</div>
          </motion.article>
          );
        })}
      </div>
    </div>
  );
}
