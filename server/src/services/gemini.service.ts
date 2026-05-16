import {
  GoogleGenerativeAI,
  type GenerationConfig,
  type ResponseSchema
} from "@google/generative-ai";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";

interface GenerateTextOptions {
  generationConfig?: GenerationConfig;
  responseSchema?: ResponseSchema;
}

let geminiClient: GoogleGenerativeAI | undefined;

export function isGeminiConfigured() {
  const apiKey = env.geminiApiKey.trim();

  return apiKey.length > 0 && !apiKey.startsWith("replace-with");
}

function getGeminiClient() {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(env.geminiApiKey);
  }

  return geminiClient;
}

function toGeminiHttpError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("quota") || lowerMessage.includes("429")) {
    return new HttpError(429, "Gemini quota exceeded. Check the API key quota or billing.");
  }

  if (lowerMessage.includes("api key") || lowerMessage.includes("permission")) {
    return new HttpError(502, "Gemini request failed. Check the configured API key.");
  }

  if (lowerMessage.includes("not found") || lowerMessage.includes("not supported")) {
    return new HttpError(502, "Gemini request failed. Check the configured Gemini model.");
  }

  return new HttpError(502, "Gemini request failed. Try again later.");
}

export async function generateGeminiText(prompt: string, options: GenerateTextOptions = {}) {
  const generationConfig: GenerationConfig = {
    temperature: 0.3,
    maxOutputTokens: 700,
    ...options.generationConfig
  };

  if (options.responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = options.responseSchema;
  }

  const model = getGeminiClient().getGenerativeModel({
    model: env.geminiModel,
    generationConfig
  });
  let text: string;

  try {
    const result = await model.generateContent(prompt);
    text = result.response.text().trim();
  } catch (error) {
    throw toGeminiHttpError(error);
  }

  if (!text) {
    throw new HttpError(502, "Gemini returned an empty response.");
  }

  return text;
}

export async function generateWithGemini(prompt: string) {
  if (!isGeminiConfigured()) {
    return {
      text: "Gemini API placeholder response. Add GEMINI_API_KEY to enable real responses.",
      prompt,
      usedMock: true
    };
  }

  return {
    text: await generateGeminiText(prompt),
    usedMock: false
  };
}
