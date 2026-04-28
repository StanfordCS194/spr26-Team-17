import { tryMatchCanonicalResponse } from "./chatTestMatrix.js";
import { enrichChatPayload } from "../src/lib/sessionFits.js";

const geminiResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "personalization"],
  properties: {
    reply: { type: "string" },
    personalization: {
      type: "object",
      additionalProperties: false,
      required: [
        "recommendedSlug",
        "recommendedProductName",
        "focusAudience",
        "priorities",
        "featuredSegments",
        "comparisonFocus",
        "highlightedPricingTier",
        "followUpPrompts",
        "heroTitle",
        "heroDescription",
        "ctaLabel",
        "summary"
      ],
      properties: {
        recommendedSlug: {
          type: "string",
          enum: ["pulseband", "pulsering", "pulsewatch"]
        },
        recommendedProductName: {
          type: "string",
          enum: ["PulseBand", "PulseRing", "PulseWatch"]
        },
        focusAudience: { type: "string" },
        priorities: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 4
        },
        featuredSegments: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 3
        },
        comparisonFocus: {
          type: "string",
          enum: ["PulseBand", "PulseRing", "PulseWatch"]
        },
        highlightedPricingTier: { type: "string" },
        followUpPrompts: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 4
        },
        heroTitle: { type: "string" },
        heroDescription: { type: "string" },
        ctaLabel: { type: "string" },
        summary: { type: "string" }
      }
    }
  }
};

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function getModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) return {};

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function extractTextFromResponse(payload) {
  return payload?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function buildPrompt(message, messages) {
  const recentMessages = Array.isArray(messages) ? messages.slice(-24) : [];

  return [
    "You are PulseWear AI — write like a sharp, empathetic store associate on the floor, not like internal analytics software.",
    "Read the ENTIRE conversation — every user message is cumulative context. Goals added in later bubbles still matter.",
    "Your natural-language reply MUST reflect the combined story across the thread, not only the latest sentence.",
    "Voice: warm, confident, consultative — like you're talking beside someone, not writing a handbook.",
    "Never paste or quasi-quote earlier user messages verbatim. Paraphrase in fresh wording so it sounds respectful, not robotic.",
    "The storefront flow may prepend a lifestyle tableau sentence before your JSON reply is stitched in; do NOT echo or restate that preamble in your `reply`'s opening—answer forward with fresh substance (trade-offs, device nuance, next beat).",
    "Prefer short passages: the `reply` field should normally stay under roughly 140 words.",
    "Each turn, change how you open and structure the `reply`—avoid repeating the same introductory hook, rhythm, or rhetorical pattern from your previous answer in this thread.",
    "",
    "When the user asks a factual or reassurance question (fit, sizing, wrists or fingers for ring vs band vs watch, body size, allergy, waterproofing, battery or charging compatibility, refunds, pairing with phones, etc.):",
    "- Answer that question FIRST in crisp language. Prefer about 3–8 sentences unless genuinely complex.",
    "- State only what fits the shopper's concrete concern. If PulseWear canon does not specify a detail (exact ring sizes mm, SKU lists, grams), say you do not have that spec here and invite them to the product page/support instead of guessing.",
    "- Avoid leading with stacked descriptions of PulseBand/PulseRing/PulseWatch unless the user is shopping or comparing personas; do NOT restate generic sales blurbs already implied by personalization.",
    "Device mapping — pick the SINGLE best overall primary slug (server logic also ranks runners-up separately):",
    "- pulseband: athletics, cardio, race prep, lifting, pacing, readiness, recovery from hard training",
    "- pulsering: discreet hardware, affordability, wellness, sleep, stress calm, ring-style summaries",
    "- pulsewatch: coursework, calendars, LTE/travel, dense notifications, multitasking, productivity",
    "When goals conflict across the thread, call out trade-offs briefly; never default to PulseWatch when training or wellness clearly dominates.",
    "",
    "Return JSON per schema.",
    "personalization.recommendedSlug / recommendedProductName / comparisonFocus must match your ONE top pick consistently.",
    "Keep the reply concise, warm, and specific to accumulated needs.",
    "Priorities: short phrases (fitness, recovery, sleep, focus, productivity, stress, budget, lifestyle).",
    "featuredSegments: audience tiles on the homepage.",
    "highlightedPricingTier: plausible tier label for that primary device lineup.",
    "followUpPrompts: 2–4 short next requests.",
    "Hero title/description/CTA should match the slug you chose as primary.",
    "",
    `Full conversation (role + content, oldest first): ${JSON.stringify(recentMessages)}`,
    `Latest user message (also included above): ${message}`
  ].join("\n");
}

export async function handleGeminiChatRequest(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const body = await readJsonBody(req);
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!message) {
      return sendJson(res, 400, { error: "A message is required." });
    }

    if (process.env.SKIP_CANONICAL_CASES !== "1") {
      const canonical = tryMatchCanonicalResponse(message);
      if (canonical) {
        return sendJson(res, 200, enrichChatPayload(canonical, messages));
      }
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return sendJson(res, 503, {
        error: "GEMINI_API_KEY is not configured on the server."
      });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${getModel()}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildPrompt(message, messages)
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: geminiResponseSchema
          }
        })
      }
    );

    const payload = await geminiResponse.json();
    if (!geminiResponse.ok) {
      const apiError =
        payload?.error?.message || "Gemini request failed.";
      return sendJson(res, geminiResponse.status, { error: apiError });
    }

    const text = extractTextFromResponse(payload);
    if (!text) {
      return sendJson(res, 502, {
        error: "Gemini returned an empty response."
      });
    }

    const parsed = JSON.parse(text);
    return sendJson(res, 200, enrichChatPayload(parsed, messages));
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error."
    });
  }
}
