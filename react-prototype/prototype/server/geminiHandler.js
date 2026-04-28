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
    "The product options are only:",
    "- PulseBand: athletes, runners, gym users, recovery, training performance",
    "- PulseRing: professionals, wellness users, older adults, sleep, stress, health insights",
    "- PulseWatch: students, tech users, multitaskers, productivity, apps, all-in-one daily use",
    "Choose the single best-fit device based on the user's goals.",
    "Keep the reply concise, warm, and specific to the user's request.",
    "Priorities should be short phrases like fitness, recovery, sleep, focus, productivity, stress, health, budget, lifestyle.",
    "featuredSegments should be the audience cards on the homepage that deserve emphasis.",
    "comparisonFocus should be the device that should stand out in the comparison table.",
    "highlightedPricingTier should be the plan tier that best fits the shopper for the recommended device.",
    "followUpPrompts should be short clickable suggestions for the assistant.",
    "Hero title and CTA should sound polished and website-ready.",
    `Recent conversation: ${JSON.stringify(recentMessages)}`,
    `Latest user message: ${message}`
  ].join("\n");
}

export async function handleGeminiChatRequest(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return sendJson(res, 503, {
      error: "GEMINI_API_KEY is not configured on the server."
    });
  }

  try {
    const body = await readJsonBody(req);
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!message) {
      return sendJson(res, 400, { error: "A message is required." });
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
