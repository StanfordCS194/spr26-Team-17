/**
 * First-party embed prototype: static page profile → rule-based variant → optional AI-shaped fallback.
 * No Chrome APIs. For publisher sites: <script src="embed.js" defer></script>
 */
(function () {
  function clip(s, n) {
    s = s || "";
    return s.length <= n ? s : s.slice(0, n) + "…";
  }

  function roundToBucket(n) {
    if (n < 1000) return n;
    return Math.round(n / 1000) + "k";
  }

  function analyzePage() {
    const doc = document;
    const title = (doc.title || "").trim();
    const url = location.href;
    const metaDesc =
      (doc.querySelector('meta[name="description"]') || doc.querySelector("meta[name=description]"))?.getAttribute("content")?.trim() || "";

    const mainSelectors = ["main", "[role=main]", "article", "#main", "#content", ".main", "#main-content"];
    let mainEl = null;
    let usedSelector = null;
    for (const s of mainSelectors) {
      const m = doc.querySelector(s);
      if (m && m.textContent && m.textContent.trim().length > 200) {
        mainEl = m;
        usedSelector = s;
        break;
      }
    }
    if (!mainEl) {
      mainEl = doc.body;
      usedSelector = "body";
    }

    const rawText = (mainEl.innerText || mainEl.textContent || "").replace(/\s+/g, " ").trim();
    const textLength = rawText.length;
    const textSample = rawText.slice(0, 1200);
    const headingCount = mainEl.querySelectorAll("h1, h2, h3").length;
    const hasSearchForm =
      !!doc.querySelector(
        'input[type=search], input[role=search], [role=search] form, form[action*="/search"], form[action*="search"]'
      ) || /search|query|q=/.test(url.toLowerCase());

    const formCount = doc.querySelectorAll("form").length;
    const linkCount = doc.querySelectorAll("a[href]").length;
    const imageCount = doc.querySelectorAll("img, picture > img, picture > source").length;
    const hasPricingSignals =
      !!doc.querySelector('[class*="pric"], [id*="pric"], [data-testid*="pric"]') ||
      /\b(pricing|plans?|subscribe|per month|\/mo\b)/i.test(rawText.slice(0, 8000));
    const hasCtaSignals =
      !!doc.querySelector('a[href*="signup"], a[href*="sign-up"], a[href*="trial"], button[class*="cta"]') ||
      /\b(start free|get started|book demo|try free)\b/i.test(rawText);

    let confidence = 0.5;
    if (usedSelector !== "body") confidence += 0.12;
    if (textLength > 800) confidence += 0.08;
    if (headingCount > 0) confidence += 0.08;
    if (metaDesc) confidence += 0.08;
    confidence = Math.min(0.95, Math.max(0.2, confidence));

    const staticSummary = [
      textLength
        ? `~${roundToBucket(textLength)} chars in ${usedSelector === "body" ? "body (no clear main)" : usedSelector}.`
        : "Little text in main region.",
      hasSearchForm ? "Search present." : "No obvious search.",
      hasPricingSignals ? "Pricing-like signals." : "No strong pricing signals.",
      hasCtaSignals ? "Strong CTA language." : "Soft or no CTA cues.",
    ].join(" ");

    return {
      title,
      url,
      mainSelector: usedSelector,
      textLength,
      textSample,
      metaDescription: metaDesc,
      headingCount,
      hasSearchForm,
      formCount,
      linkCount,
      imageCount,
      hasPricingSignals,
      hasCtaSignals,
      confidence,
      staticSummary,
    };
  }

  /** Heuristic "intent" for demo — not demographic inference. */
  function inferIntent(profile) {
    if (profile.hasPricingSignals && profile.hasCtaSignals) return { intent: "evaluate_offer", label: "Likely comparing or buying" };
    if (profile.hasSearchForm && profile.textLength > 4000) return { intent: "find_information", label: "Search / long-form read" };
    if (profile.headingCount >= 4 && profile.textLength > 2500) return { intent: "read_article", label: "Reading / documentation" };
    return { intent: "general_browse", label: "General browse" };
  }

  function pickVariantStatic(profile, intent) {
    if (intent.intent === "evaluate_offer") return { variant: "focus-cta", reason: "Pricing + CTA detected — emphasize trial row." };
    if (intent.intent === "find_information") return { variant: "search-first", reason: "Search-heavy page — lift search affordance." };
    if (intent.intent === "read_article") return { variant: "reading", reason: "Long structured text — reading density." };
    return { variant: "default", reason: "No strong rule match." };
  }

  /**
   * Demo-only "AI fallback": no network. Replace with your backend + LLM after consent.
   * Returns a small directive object publishers can map to CSS / CMS.
   */
  function mockAiDirective(profile, intent, staticVariant) {
    if (profile.confidence >= 0.72 && staticVariant.variant !== "default") {
      return {
        source: "skipped-ai",
        note: "Static confidence high enough; rules only.",
        variant: staticVariant.variant,
      };
    }
    const suggestions = {
      "evaluate_offer": { variant: "focus-cta", emphasize: ["pricing", "social-proof"], tone: "direct" },
      find_information: { variant: "search-first", emphasize: ["nav", "on-page search"], tone: "neutral" },
      read_article: { variant: "reading", emphasize: ["toc", "typography"], tone: "calm" },
      general_browse: { variant: "default", emphasize: ["hero"], tone: "neutral" },
    };
    const base = suggestions[intent.intent] || suggestions.general_browse;
    return {
      source: "mock-ai",
      note: "Replace with real model + consent gate. Uses on-page signals only.",
      variant: base.variant,
      emphasize: base.emphasize,
      tone: base.tone,
      pageTitleHint: clip(profile.title, 80),
    };
  }

  function applyVariant(directive) {
    const v = directive.variant || "default";
    document.documentElement.setAttribute("data-pt-variant", v);
    document.documentElement.setAttribute("data-pt-source", directive.source || "rules");
  }

  function run(options) {
    const opts = options || {};
    const profile = analyzePage();
    const intent = inferIntent(profile);
    const staticPick = pickVariantStatic(profile, intent);
    let directive;
    if (opts.forceAiFallback || profile.confidence < 0.72 || staticPick.variant === "default") {
      directive = mockAiDirective(profile, intent, staticPick);
      if (directive.source === "mock-ai") {
        directive.variant = directive.variant || staticPick.variant;
      }
    } else {
      directive = {
        source: "rules",
        variant: staticPick.variant,
        reason: staticPick.reason,
        intent: intent.intent,
      };
    }
    applyVariant(directive);
    return { profile, intent, staticPick, directive };
  }

  window.PageTuneAdaptiveEmbed = { analyzePage, inferIntent, pickVariantStatic, mockAiDirective, applyVariant, run };
})();
