const allowedSports = [
  "running", "training", "yoga", "basketball", "tennis", "hiking", "swimming", "cycling",
  "soccer", "golf", "baseball", "dance", "volleyball", "snow"
];

const allowedCategories = [
  "top", "shorts", "leggings", "sports bra", "jersey", "skirt", "jacket", "vest",
  "swimwear", "footwear", "pants", "bag", "socks", "hat", "gloves", "racket",
  "resistance band", "mat", "bottle", "ball", "helmet", "accessory"
];

const allowedFits = ["compressive", "relaxed", "slim", "regular", "supportive", "secure"];
const allowedEnvironments = [
  "road", "trail", "gym", "studio", "court", "field", "pool", "snow", "indoor",
  "cold", "rain", "warm", "travel"
];
const allowedFeatures = [
  "lightweight", "cushioned", "soft", "supportive", "high support", "compression",
  "durable", "breathable", "waterproof", "water-resistant", "sweat-wicking", "quick-dry",
  "reflective", "insulated", "warm", "windproof", "packable", "stretchy", "pockets",
  "grippy", "responsive", "odor-resistant", "sun protection", "protective", "zippered pockets"
];

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["intent", "reply"],
  properties: {
    intent: {
      type: "object",
      additionalProperties: false,
      required: ["updates", "addedFeatures", "actions", "notes"],
      properties: {
        updates: {
          type: "object",
          additionalProperties: false,
          properties: {
            sport: { type: "string", enum: allowedSports },
            category: { type: "string", enum: allowedCategories },
            brand: { type: "string", minLength: 1 },
            color: { type: "string", minLength: 1 },
            maxPrice: { type: "number", minimum: 1 },
            size: {
              anyOf: [
                { type: "string", minLength: 1 },
                { type: "number", minimum: 1 }
              ]
            },
            fit: { type: "string", enum: allowedFits },
            environment: { type: "string", enum: allowedEnvironments }
          }
        },
        addedFeatures: {
          type: "array",
          items: { type: "string", enum: allowedFeatures }
        },
        actions: {
          type: "array",
          items: {
            type: "string",
            enum: ["reset", "compare", "sortLow", "sortHigh", "sortRating"]
          }
        },
        notes: {
          type: "array",
          items: { type: "string" }
        }
      }
    },
    reply: { type: "string", minLength: 1 }
  }
};

function sendJson(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}

function buildPrompt(message, filters, sort, view) {
  return [
    "You are the shopping assistant for a sportswear storefront.",
    "Convert the user's message into structured storefront intent and a short helpful reply.",
    "Only use supported enum values when setting sport, category, fit, environment, features, or actions.",
    "Leave any field out of intent.updates if the user did not clearly ask to change it.",
    "Use compare only when the user asks to compare items.",
    "Use reset only when the user explicitly wants to clear or start over.",
    "Keep the reply to 1-3 short sentences and do not mention JSON.",
    `Current filters: ${JSON.stringify(filters || {})}`,
    `Current sort: ${sort || "recommended"}`,
    `Current view: ${view || "recommended"}`,
    `User message: ${message}`
  ].join("\n");
}

function extractOutputText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text) {
    return payload.output_text;
  }

  const texts = [];
  for (const item of payload.output || []) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (part.type === "output_text" && typeof part.text === "string") {
        texts.push(part.text);
      }
    }
  }
  return texts.join("").trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 503, { error: "OPENAI_API_KEY is not configured on the server." });
  }

  const { message, filters, sort, view } = req.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return sendJson(res, 400, { error: "A chat message is required." });
  }

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: buildPrompt(message.trim(), filters, sort, view),
        text: {
          format: {
            type: "json_schema",
            name: "storefront_intent",
            strict: true,
            schema: responseSchema
          }
        }
      })
    });

    const payload = await openaiResponse.json();
    if (!openaiResponse.ok) {
      const apiError = payload?.error?.message || "OpenAI request failed.";
      return sendJson(res, openaiResponse.status, { error: apiError });
    }

    const text = extractOutputText(payload);
    if (!text) {
      return sendJson(res, 502, { error: "The assistant returned an empty response." });
    }

    const parsed = JSON.parse(text);
    return sendJson(res, 200, parsed);
  } catch (error) {
    return sendJson(res, 500, { error: error instanceof Error ? error.message : "Unexpected server error." });
  }
};
