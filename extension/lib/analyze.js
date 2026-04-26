/**
 * Heuristic, local-only view of a page. No network access.
 * AI is optional and handled in the service worker.
 */
function tuneRunStaticAnalysis() {
  const doc = document;
  const title = (doc.title || "").trim();
  const url = location.href;
  const metaDesc =
    (doc.querySelector('meta[name="description"]') || doc.querySelector("meta[name='description']") || doc.querySelector("meta[name=description]") || null)?.getAttribute("content")?.trim() || "";

  const mainSelectors = [
    "main",
    "[role=main]",
    "article",
    "#main",
    "#content",
    ".main",
    "#main-content",
  ];
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

  const textSource = mainEl;
  const rawText = (textSource.innerText || textSource.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
  const textLength = rawText.length;
  const textSample = rawText.slice(0, 2000);
  const headingCount = textSource.querySelectorAll("h1, h2, h3").length;

  const hasSearchForm =
    !!doc.querySelector("input[type=search], input[role=search], [role=search] form, form[action*=\"/search\"], form[action*=\"search\"]") ||
    /search|query|q=/.test(url.toLowerCase());

  const formCount = doc.querySelectorAll("form").length;
  const linkCount = doc.querySelectorAll("a[href]").length;
  const imageCount = doc.querySelectorAll("img, picture > img, picture > source").length;

  const confidence = (() => {
    let c = 0.5;
    if (usedSelector === "body") c -= 0.15;
    else c += 0.15;
    if (textLength > 800) c += 0.1;
    if (headingCount > 0) c += 0.1;
    if (metaDesc) c += 0.1;
    return Math.min(0.95, Math.max(0.2, c));
  })();

  const staticSummary = [
    textLength
      ? `Read ~${roundToBucket(textLength)} characters of main content (${usedSelector === "body" ? "no obvious main region; used body" : "region: " + usedSelector}).`
      : "Very little text detected in the main region.",
    hasSearchForm ? "A search form or search-like URL is present." : "No obvious search form.",
    `${imageCount} media elements, ${formCount} forms, ${linkCount} links.`,
    metaDesc ? `Meta description: “${clip(metaDesc, 120)}”` : "No meta description.",
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
    confidence,
    staticSummary,
  };
}

function roundToBucket(n) {
  if (n < 1000) return n;
  return Math.round(n / 1000) + "k";
}

function clip(s, n) {
  s = s || "";
  return s.length <= n ? s : s.slice(0, n) + "…";
}
