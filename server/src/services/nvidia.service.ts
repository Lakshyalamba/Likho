import { env } from "../config/env";
import { HttpError } from "../utils/http-error";

interface GenerateNvidiaTextOptions {
  temperature?: number;
  maxTokens?: number;
}

interface NvidiaChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

export function isNvidiaConfigured() {
  const apiKey = env.nvidiaApiKey.trim();

  return apiKey.length > 0 && !apiKey.startsWith("replace-with");
}

function toNvidiaHttpError(status: number, message: string) {
  const lowerMessage = message.toLowerCase();

  if (status === 429 || lowerMessage.includes("quota") || lowerMessage.includes("rate limit")) {
    return new HttpError(429, "NVIDIA AI quota exceeded. Check the API key quota or billing.");
  }

  if (status === 401 || status === 403 || lowerMessage.includes("api key") || lowerMessage.includes("unauthorized")) {
    return new HttpError(502, "NVIDIA AI request failed. Check the configured API key.");
  }

  if (status === 404 || lowerMessage.includes("model")) {
    return new HttpError(502, "NVIDIA AI request failed. Check the configured NVIDIA model.");
  }

  return new HttpError(502, "NVIDIA AI request failed. Try again later.");
}

export async function generateNvidiaText(prompt: string, options: GenerateNvidiaTextOptions = {}) {
  if (!isNvidiaConfigured()) {
    throw new HttpError(502, "NVIDIA AI is not configured.");
  }

  const response = await fetch(`${env.nvidiaBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.nvidiaApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.nvidiaModel,
      messages: [
        {
          role: "system",
          content: "You return only strict JSON. Do not include markdown fences or extra text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 600,
      response_format: {
        type: "json_object"
      }
    })
  });

  const responseText = await response.text();
  let payload: NvidiaChatResponse | undefined;

  try {
    payload = responseText ? (JSON.parse(responseText) as NvidiaChatResponse) : undefined;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    throw toNvidiaHttpError(response.status, payload?.error?.message ?? responseText);
  }

  const text = payload?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new HttpError(502, "NVIDIA AI returned an empty response.");
  }

  return text;
}
