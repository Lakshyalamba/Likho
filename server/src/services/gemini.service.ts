import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

export async function generateWithGemini(prompt: string) {
  if (!env.geminiApiKey || env.geminiApiKey.startsWith("replace-with")) {
    return {
      text: "Gemini API placeholder response. Add GEMINI_API_KEY to enable real responses.",
      prompt
    };
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);

  return {
    text: result.response.text()
  };
}
