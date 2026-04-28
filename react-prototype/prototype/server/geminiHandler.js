import { tryMatchCanonicalResponse } from "./chatTestMatrix.js";

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
  const recentMessages = Array.isArray(messages) ? messages.slice(-6) : [];

  return [
    "You are PulseWear AI, a personalization assistant for a smartwatch and wearable website.",
    "Your job is to understand what the shopper is looking for and return both a natural reply and structured website personalization.",
    "",
    "Map intent to ONE device only:",
    "- recommendedSlug MUST be pulseband when athletics, cardio, race prep, gyms, lifts, pacing, readiness, or repetitive training dominates.",
    "- recommendedSlug MUST be pulsering when minimal hardware, affordability, wellness, sleep, stress calm, discreet office wear or ring-style summaries dominate.",
    "- recommendedSlug MUST be pulsewatch when multitasking calendars, coursework, reminders, LTE/connectivity abroad, dense notifications, productivity or student life dominates.",
    "If multiple themes appear, prioritize the shopper's MAIN goal phrase (not incidental words). Avoid defaulting to PulseWatch.",
    "",
    "The short product personas are:",
    "- PulseBand: athletes, runners, gym users — recovery/training bias",
    "- PulseRing: professionals/wellness/older-adult insight — discreet health bias",
    "- PulseWatch: students, tech users, multitaskers — apps + orchestration bias",
    "Choose the single best-fit device.",
    "Keep the reply concise, warm, and specific.",
    "Priorities: short phrases (fitness, recovery, sleep, focus, productivity, stress, budget, lifestyle).",
    "featuredSegments: audience tiles on the homepage.",
    "comparisonFocus MUST match recommendedProductName exactly.",
    "highlightedPricingTier: plausible tier label for THAT device lineup.",
    "followUpPrompts: 2–4 short next requests.",
    "Hero title/description/CTA should match the slug you picked.",
    `Recent conversation: ${JSON.stringify(recentMessages)}`,
    `Latest user message: ${message}`
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
        return sendJson(res, 200, canonical);
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
    return sendJson(res, 200, parsed);
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error."
    });
  }
}
