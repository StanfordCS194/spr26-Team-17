import { motion } from "framer-motion";

export default function SegmentCard({ segment, index, highlighted = false }) {
  const tones = [
    "from-[#edf0ff] to-white",
    "from-[#f8ede4] to-white",
    "from-[#ebf5ef] to-white",
    "from-[#f0ebff] to-white",
    "from-[#edf6ff] to-white",
    "from-[#fff0e6] to-white"
  ];

  return (
    <motion.article
      whileHover={{ y: -6 }}
      className={`surface-card h-full bg-gradient-to-br p-6 ${tones[index % tones.length]} ${highlighted ? "ring-2 ring-accent/30 shadow-[0_24px_60px_-34px_rgba(89,104,255,0.35)]" : ""}`}
    >
      {highlighted ? (
        <div className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          AI focus
        </div>
      ) : null}
      <div className="text-lg font-semibold text-ink">{segment.title}</div>
      <p className="mt-3 text-sm leading-6 text-smoke">{segment.copy}</p>
    </motion.article>
  );
}
