import { motion } from "framer-motion";

function TonePlate({ color, className = "" }) {
  return (
    <div
      className={`absolute rounded-full blur-2xl ${className}`}
      style={{ background: color }}
    />
  );
}

function BandMockup({ accent, accentSoft }) {
  return (
    <div className="relative h-full w-full">
      <TonePlate
        color={accentSoft}
        className="left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 opacity-90"
      />
      <div className="absolute left-1/2 top-4 h-[82%] w-[20%] -translate-x-1/2 rounded-[999px] bg-[#1d1d24]" />
      <div className="absolute left-1/2 top-[34%] h-20 w-24 -translate-x-1/2 rounded-[26px] border border-white/10 bg-[#2d2d39] shadow-[0_18px_35px_-18px_rgba(0,0,0,0.65)]">
        <div
          className="absolute inset-[7px] rounded-[18px] border border-white/10"
          style={{
            background: `linear-gradient(160deg, ${accent}, #0f1222)`
          }}
        />
        <div className="absolute inset-x-6 top-6 h-2 rounded-full bg-white/80" />
        <div
          className="absolute bottom-5 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full"
          style={{ background: accentSoft }}
        />
      </div>
      <div className="absolute inset-x-[38%] top-10 h-14 rounded-full border border-white/10 bg-white/15" />
      <div className="absolute inset-x-[38%] bottom-8 h-14 rounded-full border border-white/10 bg-white/15" />
    </div>
  );
}

function RingMockup({ accent, accentSoft }) {
  return (
    <div className="relative h-full w-full">
      <TonePlate
        color={accentSoft}
        className="left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 opacity-90"
      />
      <div
        className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-[24px] border-[#23232b] shadow-[0_28px_55px_-24px_rgba(0,0,0,0.45)]"
        style={{
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.08), 0 28px 55px -24px rgba(0,0,0,0.4)`,
          background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.95), rgba(255,255,255,0) 46%), ${accent}`
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-canvas shadow-inner" />
    </div>
  );
}

function WatchMockup({ accent, accentSoft }) {
  return (
    <div className="relative h-full w-full">
      <TonePlate
        color={accentSoft}
        className="left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 opacity-90"
      />
      <div className="absolute left-1/2 top-2 h-[28%] w-[24%] -translate-x-1/2 rounded-[28px] bg-[#22232b]" />
      <div className="absolute left-1/2 bottom-2 h-[28%] w-[24%] -translate-x-1/2 rounded-[28px] bg-[#22232b]" />
      <div className="absolute left-1/2 top-1/2 h-40 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[38px] border border-white/10 bg-[#1f2028] shadow-[0_26px_55px_-24px_rgba(0,0,0,0.48)]">
        <div
          className="absolute inset-[10px] overflow-hidden rounded-[28px]"
          style={{
            background: `linear-gradient(160deg, rgba(10,11,23,0.98), ${accent})`
          }}
        >
          <div className="absolute left-5 top-5 h-3 w-3 rounded-full bg-white/90" />
          <div className="absolute right-5 top-5 h-3 w-10 rounded-full bg-white/25" />
          <div className="absolute left-5 top-12 h-16 w-16 rounded-full border border-white/15 bg-white/8" />
          <div className="absolute right-5 top-14 h-5 w-8 rounded-full bg-white/20" />
          <div className="absolute right-5 top-22 h-5 w-12 rounded-full bg-white/15" />
          <div
            className="absolute bottom-5 left-1/2 h-8 w-20 -translate-x-1/2 rounded-full"
            style={{ background: accentSoft }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DeviceMockup({
  type = "band",
  accent = "#5968ff",
  accentSoft = "#e5e8ff",
  className = "",
  floating = false
}) {
  const mockups = {
    band: <BandMockup accent={accent} accentSoft={accentSoft} />,
    ring: <RingMockup accent={accent} accentSoft={accentSoft} />,
    watch: <WatchMockup accent={accent} accentSoft={accentSoft} />
  };

  const content = (
    <div
      className={`relative aspect-[1/1] w-full overflow-hidden rounded-[28px] border border-white/70 bg-white/70 backdrop-blur ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,245,238,0.55))]" />
      {mockups[type]}
    </div>
  );

  if (!floating) return content;

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
    >
      {content}
    </motion.div>
  );
}
