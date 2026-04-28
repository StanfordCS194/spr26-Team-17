import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handleGeminiChatRequest } from "./server/geminiHandler.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

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
