import { productCatalog } from "../data/siteData";

const audienceRules = [
  {
    label: "Students",
    keywords: ["student", "school", "class", "college", "study", "campus", "homework"],
    preferred: "pulsewatch"
  },
  {
    label: "Athletes",
    keywords: ["athlete", "training", "recovery", "run", "runner", "workout", "gym", "performance"],
    preferred: "pulseband"
  },
  {
    label: "Professionals",
    keywords: ["work", "professional", "meeting", "busy", "office", "career"],
    preferred: "pulsering"
  },
  {
    label: "Wellness users",
    keywords: ["wellness", "stress", "calm", "sleep", "health", "heart"],
    preferred: "pulsering"
  },
  {
    label: "Travelers",
    keywords: ["travel", "flight", "trip", "timezone", "commute"],
    preferred: "pulsewatch"
  }
];

const themeKeywords = {
  fitness: ["fitness", "workout", "exercise", "training", "run", "runner", "gym", "performance"],
  recovery: ["recovery", "rest", "strain"],
  sleep: ["sleep", "bed", "rested"],
  focus: ["focus", "study", "productivity", "attention", "calendar"],
  stress: ["stress", "anxiety", "calm", "balance"],
  budget: ["budget", "affordable", "cheap", "value", "price"],
  lifestyle: ["everyday", "daily", "simple", "comfortable"]
};

const defaultPrompt = "Find me the best PulseWear device for my daily life.";

function normalize(text) {
  return text.toLowerCase();
}

function countMatches(text, words) {
  return words.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);
}

function getDefaultProduct() {
  return productCatalog.find((product) => product.slug === "pulsewatch") || productCatalog[0];
}

export function getDefaultPersonalization() {
  const product = getDefaultProduct();

  return {
    prompt: defaultPrompt,
    recommendedSlug: product.slug,
    recommendedProductName: product.name,
    focusAudience: "Everyday users",
    priorities: ["health", "focus", "fitness"],
    featuredSegments: ["Students", "Professionals"],
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
  const text = normalize(input);
  const matchedAudience =
    audienceRules
      .map((rule) => ({ rule, score: countMatches(text, rule.keywords) }))
      .sort((a, b) => b.score - a.score)[0] || null;

  const prioritizedThemes = Object.entries(themeKeywords)
    .map(([theme, keywords]) => ({ theme, score: countMatches(text, keywords) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.theme);

  const priorities = prioritizedThemes.length
    ? prioritizedThemes.slice(0, 3)
    : ["health", "focus", "fitness"];

  const preferredSlug = matchedAudience?.score ? matchedAudience.rule.preferred : "pulsewatch";
  const product =
    productCatalog.find((item) => item.slug === preferredSlug) || getDefaultProduct();
  const focusAudience = matchedAudience?.score ? matchedAudience.rule.label : "Multitaskers";
  const featuredSegments = [
    focusAudience,
    ...product.targetSegments
  ].filter((value, index, array) => value && array.indexOf(value) === index).slice(0, 2);
  const highlightedPricingTier = product.pricing[1]?.tier || product.pricing[0]?.tier || "Standard";
  const followUpPrompts = [
    `Compare ${product.name} with another device`,
    `Show why ${product.name} fits me`,
    "Give me a budget-friendly recommendation"
  ];

  const summary = [
    `I would steer you toward ${product.name} based on what you shared.`,
    `${product.name} is strongest for ${product.homeUsers.toLowerCase()} and aligns well with ${priorities.join(", ")}.`,
    "I have updated the website direction so the most relevant device appears first and the matching sections stand out."
  ].join(" ");

  return {
    reply: summary,
    personalization: {
      prompt: input,
      recommendedSlug: product.slug,
      recommendedProductName: product.name,
      focusAudience,
      priorities,
      featuredSegments,
      comparisonFocus: product.name,
      highlightedPricingTier,
      followUpPrompts,
      heroTitle: `${product.name} looks like your best-fit starting point.`,
      heroDescription: `${product.description} Right now the site is leaning into ${focusAudience.toLowerCase()} needs and emphasizing ${priorities.join(", ")}.`,
      ctaLabel: `Explore ${product.name}`,
      summary
    }
  };
}
