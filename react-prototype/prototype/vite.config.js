import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { handleGeminiChatRequest } from "./server/geminiHandler.js";

/** Directory containing this file — used so `.env` loads even if `npm run dev` is started from the repo root. */
const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  Object.assign(process.env, env);

  const key = env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? "";
  if (mode === "development" && !String(key).trim()) {
    console.warn(
      "\n[pulsewear] GEMINI_API_KEY is missing or empty in .env (next to package.json).\n" +
        "Paste your key directly after GEMINI_API_KEY= with no spaces around =, restart npm run dev.\n"
    );
  }

  return {
    plugins: [
      react(),
      {
        name: "local-gemini-chat-api",
        configureServer(server) {
          server.middlewares.use("/api/gemini-chat", async (req, res, next) => {
            if (req.method !== "POST") {
              next();
              return;
            }

            await handleGeminiChatRequest(req, res);
          });
        }
      }
    ]
  };
});
