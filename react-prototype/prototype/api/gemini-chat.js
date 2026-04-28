import { handleGeminiChatRequest } from "../server/geminiHandler.js";

export default async function handler(req, res) {
  return handleGeminiChatRequest(req, res);
}
