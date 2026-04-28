import { productCatalog } from "../data/siteData";
import { enrichChatPayload, getPrimarySlug, PRODUCT_SLUG_NAMES } from "../lib/sessionFits";

const defaultPrompt = "Find me the best PulseWear device for my daily life.";

function normalize(text) {
  return text.toLowerCase();
}

function combinedUserText(messages) {
  return Array.isArray(messages)
    ? messages
        .filter((m) => m.role === "user" && m.content)
        .map((m) => String(m.content))
        .join("\n")
    : "";
}

function getProductBySlug(slug) {
  return productCatalog.find((p) => p.slug === slug) || productCatalog.find((p) => p.slug === "pulsewatch") || productCatalog[0];
}

/** @deprecated use getPrimarySlug from sessionFits */
export function inferProductSlug(text) {
  return getPrimarySlug(text);
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
      "Tell the assistant about your goals, routines, and budget, and the site will shift toward the devices that fit you best.",
    ctaLabel: `Start with ${product.name}`,
    summary:
      "PulseWear AI can learn what matters to you and reshape the homepage around that recommendation.",
    sessionNeedsSummary: "",
    topFits: [
      {
        rank: 1,
        slug: product.slug,
        productName: product.name,
        whyItFits: "Balanced default when your goals are still open-ended."
      }
    ]
  };
}

/**
 * Offline assistant when Gemini is unavailable. Mirrors server `enrichChatPayload` behavior.
 * @param {string} _lastInput
 * @param {Array<{ role: string; content?: string }>} allMessages Include the latest user turn.
 */
export function buildAssistantResponse(_lastInput, allMessages) {
  const raw = combinedUserText(allMessages);
  const slug = getPrimarySlug(raw);
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

  const otherFits = ["pulseband", "pulsering", "pulsewatch"]
    .filter((s) => s !== slug)
    .map((s) => PRODUCT_SLUG_NAMES[s])
    .join(", ");

  const summary = [
    `Across everything you shared, I'd steer you toward ${product.name} first.`,
    `${product.name} lines up with ${focusAudience.toLowerCase()} and priorities like ${pri.join(", ")}.`,
    `If your story also pulls toward other themes (${otherFits}), the lineup below stacks the next-best matches so nothing you said gets lost.`
  ].join(" ");

  const draft = {
    reply: summary,
    personalization: {
      prompt: raw || defaultPrompt,
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
      heroDescription: `${product.description} The site is leaning toward ${focusAudience.toLowerCase()} workflows and emphasizing ${pri.join(", ")}.`,
      ctaLabel: `Explore ${product.name}`,
      summary
    }
  };

  return enrichChatPayload(draft, allMessages);
}
