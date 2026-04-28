import { productCatalog } from "../data/siteData";

const defaultPrompt = "Find me the best PulseWear device for my daily life.";

/** Keep in sync with the first rules in `server/chatTestMatrix.js` (starter chips + parity). */
const STARTER_PARITY_RULES = [
  {
    m: (t) =>
      /\bbest wearable\b|\bwearable\b/.test(t) &&
      /\brecovery\b/.test(t) &&
      /\btraining\b/.test(t) &&
      /\bperformance\b/.test(t),
    slug: "pulseband"
  },
  {
    m: (t) =>
      /\baffordable\b|\bbudget\b/.test(t) && /\bwellness\b/.test(t) && /\bhealth\b/.test(t),
    slug: "pulsering"
  },
  {
    m: (t) =>
      /\bstudent\b/.test(t) &&
      /\b(focus|sleep)\b/.test(t) &&
      /\bworkouts?\b/.test(t),
    slug: "pulsewatch"
  }
];

const KW = {
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
    "interval"
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
    "wellness-focused"
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
    "busy desk"
  ]
};

function normalize(text) {
  return text.toLowerCase();
}

function countKeywordHits(text, list) {
  return list.reduce((n, phrase) => n + (text.includes(phrase) ? 1 : 0), 0);
}

/**
 * Offline product pick when Gemini is unavailable. Mirrors `chatTestMatrix` starter rules first.
 */
export function inferProductSlug(text) {
  const t = normalize(text);

  for (const rule of STARTER_PARITY_RULES) {
    if (rule.m(t)) return rule.slug;
  }

  let b = countKeywordHits(t, KW.pulseband);
  let ring = countKeywordHits(t, KW.pulsering);
  let watch = countKeywordHits(t, KW.pulsewatch);

  if (/student|exam|campus|homework/i.test(t)) watch += 2;
  if (/\b(student|exam|study|campus)\b/.test(t) && /(recovery|performance|training|race|running|\bgym\b)/i.test(t)) {
    b += 1;
    watch += 1;
  }

  const scores = { pulseband: b, pulsering: ring, pulsewatch: watch };
  let best = /** @type {keyof typeof scores} */ ("pulsewatch");
  let hi = -1;
  for (const [slug, v] of Object.entries(scores)) {
    if (v > hi) {
      hi = v;
      best = slug;
    }
  }
  if (hi <= 0) return "pulsewatch";

  const tied = Object.entries(scores).filter(([, v]) => v === hi).map(([k]) => k);
  if (tied.length === 1) return best;

  // Tie-break toward the clearest thematic bucket
  if (/recovery|performance|training|race|running|\bgym\b|workouts?/.test(t) && tied.includes("pulseband")) return "pulseband";
  if (/wellness|stress|minimal|budget|cheap|sleep better|finger|ring\b/.test(t) && tied.includes("pulsering")) return "pulsering";
  if (/\bstudent\b|exam|campus|focus|notifications|\b lte\b/i.test(t) && tied.includes("pulsewatch"))
    return "pulsewatch";

  return best;
}

function getProductBySlug(slug) {
  return productCatalog.find((p) => p.slug === slug) || productCatalog.find((p) => p.slug === "pulsewatch") || productCatalog[0];
}

export function getDefaultPersonalization() {
  const product = getProductBySlug("pulsewatch");

  return {
    prompt: defaultPrompt,
    recommendedSlug: product.slug,
    recommendedProductName: product.name,
    focusAudience: "Everyday users",
    priorities: ["health", "focus", "fitness"],
    featuredSegments: ["Students", "Professionals"].slice(),
    comparisonFocus: product.name,
    highlightedPricingTier: product.pricing[1]?.tier || product.pricing[0]?.tier || "Standard",
    followUpPrompts: [
      `Compare ${product.name} with the other devices`,
      "Show me the best option for sleep and recovery",
      "What is the most affordable choice?"
    ],
    heroTitle: "AI mode is ready when you want a more personal shopping path.",
    heroDescription:
      "Tell the assistant about your goals, routines, and budget, and the site will shift toward the device that fits you best.",
    ctaLabel: `Start with ${product.name}`,
    summary:
      "PulseWear AI can learn what matters to you and reshape the homepage around that recommendation."
  };
}

export function buildAssistantResponse(input) {
  const raw = String(input || "");
  const slug = inferProductSlug(raw);
  const product = getProductBySlug(slug);

  const t = normalize(raw);
  /** @type {string[]} */
  const pri = [];
  const themePairs = [
    ["fitness", ["fitness", "workout", "run", "gym", "training"]],
    ["recovery", ["recovery", "rest"]],
    ["sleep", ["sleep", "bed"]],
    ["focus", ["focus", "study", "productivity"]],
    ["wellness", ["wellness", "stress", "calm"]],
    ["value", ["affordable", "budget", "price", "cheap"]],
    ["lifestyle", ["everyday", "daily"]]
  ];
  for (const [theme, words] of themePairs) {
    if (words.some((w) => t.includes(w)) && pri.length < 4) pri.push(theme);
  }
  if (!pri.length) {
    pri.push(
      ...(slug === "pulseband"
        ? ["training", "recovery"]
        : slug === "pulsering"
          ? ["wellness", "sleep"]
          : ["focus", "movement"])
    );
  }

  const focusAudience =
    slug === "pulseband"
      ? "Performance-minded movers"
      : slug === "pulsering"
        ? "Wellness-focused shoppers"
        : "Students & multitaskers";

  let featuredSegments = [...product.targetSegments].slice(0, 4);
  const segFromText = /\b(student|exam|study|campus)\b/i.test(t)
    ? "Students"
    : /\b(athlete|run|gym|race)\b/i.test(t)
      ? "Athletes"
      : /\bprofessional|office\b/i.test(t)
        ? "Professionals"
        : null;

  if (segFromText) {
    featuredSegments = Array.from(new Set([segFromText, ...featuredSegments])).slice(0, 3);
  }

  let highlightedPricingTier =
    product.pricing[1]?.tier || product.pricing[0]?.tier || "Standard";
  if (/ultra|elite|ultimate|\b lte\b|team\b|\/mo premium/i.test(t)) highlightedPricingTier = product.pricing[2]?.tier || highlightedPricingTier;
  else if (/cheap|budget|essential|starter|affordable|most affordable/i.test(t))
    highlightedPricingTier = product.pricing[0]?.tier || highlightedPricingTier;

  const summary = [
    `I would steer you toward ${product.name} based on what you shared.`,
    `${product.name} is strongest for ${product.homeUsers.toLowerCase()} and aligns well with ${pri.join(", ")}.`,
    `I have updated the website direction so the most relevant device appears first and ${product.name}'s strongest sections stand out.`
  ].join(" ");

  return {
    reply: summary,
    personalization: {
      prompt: raw,
      recommendedSlug: product.slug,
      recommendedProductName: product.name,
      focusAudience,
      priorities: pri,
      featuredSegments,
      comparisonFocus: product.name,
      highlightedPricingTier,
      followUpPrompts: [
        `Compare ${product.name} with another device`,
        `Show why ${product.name} fits me`,
        "Give me a budget-friendly recommendation"
      ],
      heroTitle: `${product.name} looks like your best-fit starting point.`,
      heroDescription: `${product.description} Right now the site is leaning toward ${focusAudience.toLowerCase()} workflows and emphasizing ${pri.join(", ", pri)}.`,
      ctaLabel: `Explore ${product.name}`,
      summary
    }
  };
}
