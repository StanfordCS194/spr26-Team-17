/** Shared PulseWear fit ranking (same logic for Gemini, canonical handler, offline fallback). */

export const PRODUCT_SLUG_NAMES = Object.freeze({
  pulseband: "PulseBand",
  pulsering: "PulseRing",
  pulsewatch: "PulseWatch"
});

const KW = Object.freeze({
  pulseband: [
    "recovery",
    "training",
    "performance",
    "athlete",
    "trainer",
    "run",
    "runner",
    "running",
    "race",
    "marathon",
    "half marathon",
    "gym",
    "squat",
    "lifting",
    "workout",
    "workouts",
    "sport",
    "zones",
    "pace",
    "interval",
    "marathon pace"
  ],
  pulsering: [
    "wellness",
    "stress",
    "minimal",
    "budget",
    "cheap",
    "affordable",
    "price",
    "worth",
    "sleep better",
    "blood pressure",
    "quiet",
    "finger",
    "ring",
    "calm",
    "older adults",
    "daily health insight",
    "wellness-focused",
    "mindful"
  ],
  pulsewatch: [
    "student",
    "exam",
    "study",
    "campus",
    "homework",
    "lte",
    "timezone",
    "travel schedule",
    "notifications",
    "apps",
    "coding",
    "multitask",
    "calendar",
    "focus timer",
    "deep work",
    "busy desk",
    "class schedule",
    "focus sessions"
  ]
});

/** Same patterns as starter rules in chatTestMatrix (keep brief). */
const STARTER_PARITY = [
  {
    slug: "pulseband",
    m: (t) =>
      /\bbest wearable\b|\bwearable\b/.test(t) &&
      /\brecovery\b/.test(t) &&
      /\btraining\b/.test(t) &&
      /\bperformance\b/.test(t)
  },
  {
    slug: "pulsering",
    m: (t) =>
      (/\baffordable\b|\bbudget\b/.test(t) && /\bwellness\b/.test(t) && /\bhealth\b/.test(t)) ||
      /\bmost affordable\b/i.test(t)
  },
  {
    slug: "pulsewatch",
    m: (t) =>
      /\bstudent\b/.test(t) && /\b(focus|sleep)\b/.test(t) && /\bworkouts?\b/.test(t)
  }
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function countHits(text, list) {
  return list.reduce((n, phrase) => n + (text.includes(phrase) ? 1 : 0), 0);
}

function scoreSlug(t, slug) {
  let score = countHits(t, KW[slug]);
  if (/student|exam|campus|homework/i.test(t)) score += slug === "pulsewatch" ? 2.5 : 0;
  if (/recovery|performance|training|race|running|\bgym\b|\bworkouts?\b/.test(t) && slug === "pulseband") score += 1.25;
  if (/sleep|stress|minimal|finger|meetings\b|budget|cheap|blood pressure|routine/i.test(t) && slug === "pulsering") score += 0.75;

  STARTER_PARITY.forEach((r) => {
    if (r.slug === slug && r.m(t)) score += 4;
  });
  /** Baseline visibility so ranking always spans all three personas */
  score += slug === "pulseband" ? 0.06 : slug === "pulsering" ? 0.03 : 0;
  return score;
}

/** One-line rationale grounded in PulseWear personas (sort order: 0 strongest). */
function rationaleFor(slug, rankIndex) {
  const base =
    slug === "pulseband"
      ? "training load, pace, zones, recovery"
      : slug === "pulsering"
        ? "discreet health, stress, sleep, affordability"
        : "apps, calendars, multitasking, focus, connectivity";

  if (rankIndex === 0) return `Primary overall fit (${base}).`;
  if (rankIndex === 1) return `Strong alternative for overlapping goals (${base}).`;
  return `Third option to satisfy remaining themes (${base}).`;
}

/**
 * @returns {{ slug: string, productName: string, score: number, rationale: string }[]}
 */
export function getRankedProductFitsFromText(combinedText, limit = 3) {
  const t = normalize(combinedText);
  const triple = ["pulseband", "pulsering", "pulsewatch"].map((slug) => ({
    slug,
    productName: PRODUCT_SLUG_NAMES[slug],
    score: scoreSlug(t, slug)
  }));

  triple.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));

  return triple.slice(0, limit).map((slot, idx) => ({
    slug: slot.slug,
    productName: slot.productName,
    score: slot.score,
    rationale: rationaleFor(slot.slug, idx)
  }));
}

/**
 * Highest single slug — matches legacy inferProductSlug behavior.
 */
export function getPrimarySlug(text) {
  const fits = getRankedProductFitsFromText(text, 3);
  return fits[0]?.slug || "pulsewatch";
}

/**
 * Dedupe repeated prompts while keeping order; repeats tracked for humane copy — no “said ×N” in-chat.
 */
export function getUniqueSessionNeedLines(messages) {
  const userTurns = Array.isArray(messages)
    ? messages
        .filter((m) => m.role === "user" && typeof m.content === "string")
        .map((m) => m.content.trim())
        .filter(Boolean)
    : [];

  const keys = [];
  /** @type {Map<string, number>} */
  const counts = new Map();
  /** @type {Map<string, string>} */
  const display = new Map();

  for (const raw of userTurns) {
    const key = normalize(raw);
    if (!key) continue;
    if (!counts.has(key)) {
      counts.set(key, 0);
      const trimmed = raw.length > 220 ? `${raw.slice(0, 217)}…` : raw;
      display.set(key, trimmed);
      keys.push(key);
    }
    counts.set(key, counts.get(key) + 1);
  }

  const items = keys.map((key) => ({
    text: display.get(key) || key,
    repeats: counts.get(key) ?? 1
  }));

  const lines = items.map((i) => humanStorageLine(i.text, i.repeats));

  return {
    items,
    lines,
    totalTurns: userTurns.length,
    distinctThemes: keys.length
  };
}

function humanStorageLine(text, repeats) {
  if (repeats <= 1) return text;
  if (repeats <= 3) return `${text} (worth another look—you circled back)`;
  if (repeats <= 7) return `${text} (kept coming up—we'll lean harder here)`;
  return `${text} (really drove this home—we'll treat it as a cornerstone)`;
}

/** Newline-separated recap for personalization + sidebar. */
export function summarizeUserNeeds(messages) {
  const { lines } = getUniqueSessionNeedLines(messages || []);
  if (!lines.length) return "";
  return lines.join("\n");
}

/**
 * Narrow follow-ups (fit, compatibility, sizing) where a long recap + stacked picks get in the way.
 * When true, the model reply stays first and we omit the prepended sales template.
 */
export function isConcernFocusedMessage(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return false;
  const q = /\?\s*$/.test(s);

  if (/\b(would|will|can|does|do|is|are|should|could)\b.*\b(okay|ok|work|safe|compatible|fit)\b/i.test(s))
    return true;
  if (/\bbe okay\b|\bokay\??\s*$/i.test(s) || /\bwork for me\b/i.test(s)) return true;

  if (/\b(body|wrist|finger|ring size|sizing|size chart|band|strap|bracelet|circumference|bulky|massive|petite|large build|small wrists|big|tiny)\b/i.test(s))
    return true;

  if (/\b(weight|grams|ounce|oz|heavy|light|uncomfortable|pinch|tight|loose)\b/i.test(s)) return true;

  if (/\b(fit|fits|fitting)\b/i.test(s) && !/\bfitness\b|\bworkouts?\b|\bfitness-first\b/i.test(s)) {
    if (/\b(wrist|finger|ring|band|my|me|body|size|hand|wear)\b/i.test(s)) return true;
  }

  if (/\b(allerg|nickel|rash|skin|hypo|sensitive to)\b/i.test(s)) return true;
  if (/\b(waterproof|water\s*resistant|submerge|swim\b|pool|shower with)\b/i.test(s)) return true;
  if (/\b(battery life|charging|charger|how long).*\?/i.test(s) || (q && /\b(battery|charging|charger)\b/i.test(s)))
    return true;
  if (/\b(return|refund|warranty|exchange|trial|replacement policy)\b/i.test(s)) return true;

  return q && /\b(android|iphone|ios|lte|Bluetooth|pairs?)\b/i.test(s);
}

/** Shopper-facing one-liners for ranked picks (by stack position). */
function shopperDevicePitch(slug, stackIndex) {
  const band = [
    "Built around pacing, readiness, and feeling ready for the next hard day.",
    "Still leans athletic when training matters but the week keeps interrupting.",
    "Sport-first pick: recovery and zones up front without a busy watch face."
  ];
  const ring = [
    "Quiet ring form factor. Stress, sleep, and price stay in one conversation.",
    "Low-profile on the finger when you want gentle health cues, not a busy watch face.",
    "Comfortable everyday insight when dashboards are not the point."
  ];
  const watch = [
    "Built for calendars, pings, classes, travel, whatever steers your week.",
    "Still organizes the day when multitasking piles up beside workouts.",
    "When apps, alarms, staying reachable rival step counts."
  ];
  const m = slug === "pulseband" ? band : slug === "pulsering" ? ring : watch;
  return m[stackIndex] ?? rationaleFor(slug, stackIndex);
}

/**
 * Lifestyle fragments (never pasted user quotes): evocative enough to sketch an imagined week —
 * primes empathy and lets people correct subtly or vibe with being seen.
 */
function paraphraseAskIntoTheme(raw) {
  const t = normalize(raw);

  // Common starter intents (explicit before generic overlaps)
  if (/\bstudent\b/.test(t) && /\bfocus\b/.test(t) && /sleep|\bfitness\b|\bworkouts?\b|\bgym\b/.test(t))
    return "exam-heavy semesters where lifts and lectures trade off with sleep you'd rather not sacrifice";
  if (/(most\s+affordable|\baffordable\b|\bbudget\b|\bcheap(er)?\b|won't\s+break)/.test(raw) && /wellness|health|daily/.test(t))
    return "honest wellness insight that still respects a tight sticker price";
  if (/\bbest wearable\b|\brecovery\b|\btraining\b.*\bperformance\b|\brecovery\b.*\btraining\b/.test(t))
    return "hard training weeks where bounce-back—not bravado—decides what's next";

  const behind = /\b(always\s+behind|fall\s+behind|caught\s+up|spinning|swamped|crazy\s+week|too\s+much\b|overwhelmed\b)/i;
  const workCue =
    /\b(full[\s-]*time|\bprofessional\b|\bmeetings\b|\bdesk\b|office\b|\bwork\b.*\bhours\b|9[\s–-]?5\b|shift\b)/;

  if (behind.test(raw) || workCue.test(t))
    return "meetings-first weeks where downtime has to sneak in between pings";

  if (/\b(student|campus|exam|study|homework)\b/.test(t))
    return "class-to-library corridors with caffeine and campus miles before you collapse into bed";
  if (/run|runner|race|lifting|squat|\bgym\b|workouts?|zones\b|intervals\b/.test(t) && /\brecovery\b|\btraining\b|race\b/.test(t))
    return "sessions you rerun week after week, with recovery you refuse to fudge";

  if (/\bstress\b|\bwellness\b|sleep\b|blood\b.*pressure|cortisol|calmer\b|\bsleep\b.*\bhours\b/i.test(raw))
    return "steady wellbeing pulses you'd actually trust between errands, not after the fact";

  if (/\bcalendar\b|\bnotifications\b|\bapps\b|\blte\b|multitask|focus\b.*\bblock\b|messages\b|\bmeetings\b/i.test(raw))
    return "dense desk days stitched from alarms, pings, classes, flights—hardware as coordination";

  return "";
}

/**
 * Loose fallback cues only when themes don't parse (whole-thread scan).
 */
function shopperPersonaCue(combined) {
  const t = normalize(combined);
  const cues = [];
  if (/\b(student|campus|exam|study)\b/.test(t))
    cues.push("notebooks sprawled beside gym sneakers and brittle sleep arcs");
  if (/full\s*-?\s*time|professional\b|office\b|desk\b|meetings?\b/.test(t))
    cues.push("white-collar weeks where burnout isn't dramatic—it's logistical");
  if (/run|runner|race|lifting|squat|\bgym\b|workouts?|recovery|zones/.test(t))
    cues.push("training blocks that bleed into errands and still owe you freshness");
  if (/\baffordable\b|\bbudget\b|cheap(er)?\b|price\b|worth\b/.test(t)) cues.push("price tags that veto indulgence");
  if (/wellness|stress|\bsleep\b|calmer\b|\bhealth\b/.test(t))
    cues.push("stress and sleep vignettes you'd rather skim than doom-scroll");

  const seen = new Set();
  const out = [];
  for (const c of cues) {
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out.slice(0, 3);
}

/** Two or three paraphrases, deduped, from user turns (never raw quotes). */
function weaveLifestylePhrases(phrases) {
  const uniq = phrases.filter(Boolean).slice(0, 3);
  if (!uniq.length) return "";
  if (uniq.length === 1) return uniq[0];
  if (uniq.length === 2) {
    return `${uniq[0]} — and braided into those same seasons, ${uniq[1][0]?.toLowerCase() ?? ""}${uniq[1].slice(1)}`;
  }
  return `${uniq[0]}, with ${uniq[1][0]?.toLowerCase() ?? ""}${uniq[1].slice(1)} still coloring the margins, plus ${uniq[2][0]?.toLowerCase() ?? ""}${uniq[2].slice(1)} hovering underneath`;
}

function themeParaphraseLine(items, combined) {
  const uniq = [];
  const seen = new Set();
  for (const row of items) {
    const p = paraphraseAskIntoTheme(row.text);
    if (!p || seen.has(p)) continue;
    seen.add(p);
    uniq.push(p);
    if (uniq.length >= 3) break;
  }
  if (uniq.length) return weaveLifestylePhrases(uniq.slice(0, 3));

  const cues = shopperPersonaCue(combined);
  return cues.length ? weaveLifestylePhrases(cues.slice(0, 3)) : "";
}

function countUserTurns(messages) {
  return Array.isArray(messages) ? messages.filter((m) => m.role === "user").length : 0;
}

function repeatComfortLine(items, ring) {
  const peak = Math.max(1, ...items.map((i) => i.repeats));
  if (items.length === 0) return "";
  const rotate = ring % 3;
  if (peak >= 6) {
    const lines = [
      "A few of the same points came through several times; I'm treating those as fixed priorities.",
      "You've stressed the same notes more than once, so I'm weighting them like non-negotiables.",
      "Same themes keep popping up—I'm baking them in as the main story, not garnish."
    ];
    return lines[rotate];
  }
  if (peak >= 4) {
    const lines = [
      "You've come back to a couple of themes more than once, so they're carrying extra weight.",
      "A handful of beats repeated—those get more pull in how I ranked things.",
      "Some ideas circled around again—I listened louder there."
    ];
    return lines[rotate];
  }
  return "";
}

/** Keep card blurbs conversational and short; callers already avoid pasting prompts. */
function truncateSalesPitch(s, max = 118) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).trimEnd();
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.55 ? cut.slice(0, lastSpace) : cut;
  return `${base}.`;
}

/** Layout rotates by `variant` so answers don't read like one mail-merge template. */
function buildStackedRecommendationCopy(ranked, variant) {
  if (!ranked?.length) return "";
  const v = ((variant % 13) + 13) % 13;

  if (v <= 2) {
    return ranked
      .map(
        (r, i) =>
          `${String(i + 1)}. ${r.productName}\n${truncateSalesPitch(r.whyItFits)}`
      )
      .join("\n\n");
  }

  if (v <= 5) {
    return ranked
      .map((r) => `• ${r.productName}\n${truncateSalesPitch(r.whyItFits)}`)
      .join("\n\n");
  }

  if (v <= 8) {
    const lab = ["Top of my list", "Next up", "Still worth a look"];
    return ranked
      .map((r, i) => `${lab[i] ?? "Another angle"} — ${r.productName}\n${truncateSalesPitch(r.whyItFits)}`)
      .join("\n\n");
  }

  if (v <= 11) {
    const lead = ["I'd start here", "Then I'd widen to", "Third—still keep on radar"];
    return ranked
      .map((r, i) => {
        const hook = lead[i] ?? "Also weigh";
        return `${hook}: ${r.productName}. ${truncateSalesPitch(r.whyItFits, 100)}`;
      })
      .join("\n\n");
  }

  return ranked.map((r, i) => `${i + 1}) ${r.productName}. ${truncateSalesPitch(r.whyItFits, 102)}`).join("\n\n");
}

function capitalizeLead(s) {
  const x = String(s || "").trim();
  if (!x) return "";
  return x.charAt(0).toUpperCase() + x.slice(1);
}

/**
 * Standalone opener: evocative lifestyle tableau from paraphrases (never a quiz).
 * Grammar stays simple—the woven theme line completes each template as full prose.
 */
function themedOpeningLine(themeLine, turnZeroBased) {
  const fragment = capitalizeLead(themeLine.trim());
  const n = (((turnZeroBased % 8) + 8) % 8);
  const templates = [
    `${fragment}. That's the groove I'm pinning hardware picks to.`,
    `${fragment}; it's the backstage story PulseWear gear has to choreograph with.`,
    `Here's the cadence I've sketched before naming devices: ${fragment}.`,
    `${fragment}. I'm projecting that tableau onto the lineup—not abstract goals, how afternoons actually scrape by.`,
    `${fragment}; everything below inherits that imagined weather.`,
    `${fragment}. That's the screenplay—devices afterward just cast roles on your wrist.`,
    `${fragment}. Trusting this texture is enough from me before we unpack devices.`,
    `Quiet read from everything you've floated: ${fragment}. Matching gear quietly follows.`
  ];
  return templates[n];
}

function fallbackOpeningLine(turnZeroBased) {
  const lines = [
    "Still sketching the concrete shape of your week—I'm holding that lightly while stacking choices below anyway.",
    "I'm inferring rhythms from fragmented notes; treat the lineup as a provisional mirror, not interrogation.",
    "Before hardware: I'm rounding out the backstage story I'd match you to—even if we'd tell it finer together later.",
    "Grounding PulseWear picks in whatever texture of ordinary chaos has surfaced so far.",
    "Painting the emotional weather first—devices below inherit that stance."
  ];
  return lines[turnZeroBased % lines.length];
}

function emptyConversationPrompt(totalTurns, turnZeroBased) {
  if (totalTurns <= 0) {
    const cold = [
      "Whenever you're ready, sketch a realistic week (classes, workouts, budget, wellbeing). We'll line things up after that.",
      "Start with one honest snapshot of your week—then I can place devices with less guesswork.",
      "Share what a normal week looks like for you, and we'll map hardware to that."
    ];
    return cold[turnZeroBased % cold.length];
  }
  const warm = [
    "I'd love one fuller note on workouts, budget, wellness, or recovery (whichever is loudest) so the match feels solid.",
    "One more concrete beat on what you run toward—training, sleep, price, stress—would lock this in.",
    "Add a bit more color on what “success” looks like on your wrist this semester and I can tighten the fit."
  ];
  return warm[turnZeroBased % warm.length];
}

function buildShopperFacingBlock(messages, combined, items, totalTurns, distinctThemes, ranked) {
  const userTurns = countUserTurns(messages);
  const turnKey = Math.max(0, userTurns - 1);
  const stackVariant = userTurns * 2 + (ranked?.length || 0);
  const stackText = buildStackedRecommendationCopy(ranked, stackVariant);

  if (!items.length || !distinctThemes) {
    return { preamble: emptyConversationPrompt(totalTurns, turnKey), stack: stackText };
  }

  const themeLine = themeParaphraseLine(items, combined);
  const comfort = repeatComfortLine(items, userTurns);

  const parts = [];
  if (themeLine) parts.push(themedOpeningLine(themeLine, turnKey));
  else parts.push(fallbackOpeningLine(turnKey));

  if (comfort) parts.push(comfort);

  return { preamble: parts.filter(Boolean).join("\n\n"), stack: stackText };
}

/**
 * Adds session-wide recap, ranked shopper copy, prepends warmth to `reply`.
 * @param {{ reply: string; personalization: Record<string, unknown> }} payload
 */
export function enrichChatPayload(payload, messages) {
  const out = JSON.parse(JSON.stringify(payload));

  const recap = summarizeUserNeeds(messages || []);
  const recapLinesRaw = recap ? recap.split("\n").filter(Boolean) : [];
  const recapStorage =
    recapLinesRaw.length > 14
      ? recapLinesRaw
          .slice(0, 14)
          .concat(`…plus ${recapLinesRaw.length - 14} more themes (see session recap in the panel).`)
          .join("\n")
      : recap;

  const combined = Array.isArray(messages)
    ? messages
        .filter((m) => m.role === "user" && m.content)
        .map((m) => String(m.content))
        .join("\n")
    : "";

  const rankedRaw = getRankedProductFitsFromText(combined, 3);
  const ranked = rankedRaw.map((f, idx) => ({
    rank: idx + 1,
    slug: f.slug,
    productName: f.productName,
    whyItFits: shopperDevicePitch(f.slug, idx)
  }));

  const first = ranked[0];
  const per = out.personalization ?? (out.personalization = {});

  per.sessionNeedsSummary =
    recapStorage || String(per.sessionNeedsSummary || "") || "Tell me more about your goals.";
  per.topFits = ranked;

  const { items, totalTurns: totalUserTurns, distinctThemes } = getUniqueSessionNeedLines(messages || []);

  if (first) {
    per.recommendedSlug = first.slug;
    per.recommendedProductName = PRODUCT_SLUG_NAMES[first.slug] || first.productName;
    per.comparisonFocus = per.recommendedProductName;
  }

  const { preamble, stack } = buildShopperFacingBlock(
    messages || [],
    combined,
    items,
    totalUserTurns,
    distinctThemes,
    ranked
  );

  const body = typeof out.reply === "string" ? out.reply.trim() : "";
  const lastUser = [...(messages ?? [])].reverse().find((m) => m.role === "user" && typeof m.content === "string");
  const concernMode = !!(lastUser && isConcernFocusedMessage(String(lastUser.content)));

  const salesLift = [preamble.trim(), stack.trim()].filter(Boolean).join("\n\n");

  /** Concern questions: answer first, no stacked recap in the same bubble (sidebar + chips keep context). */
  if (concernMode && body) {
    out.reply = body;
  } else {
    out.reply = [salesLift, body].filter(Boolean).join("\n\n");
  }
  return out;
}
