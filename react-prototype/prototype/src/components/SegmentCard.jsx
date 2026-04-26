import { motion } from "framer-motion";

export default function SegmentCard({ segment, index }) {
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
      className={`surface-card h-full bg-gradient-to-br p-6 ${tones[index % tones.length]}`}
    >
      <div className="text-lg font-semibold text-ink">{segment.title}</div>
      <p className="mt-3 text-sm leading-6 text-smoke">{segment.copy}</p>
    </motion.article>
  );
}
