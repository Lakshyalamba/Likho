import { SchemaType, type ResponseSchema } from "@google/generative-ai";
import { generateGeminiText, isGeminiConfigured } from "./gemini.service";
import { generateNvidiaText, isNvidiaConfigured } from "./nvidia.service";
import { HttpError } from "../utils/http-error";

export interface NoteAiResult {
  summary: string;
  action_items: string[];
  suggested_title: string;
  usedMock: boolean;
}

interface GenerateNoteAiInput {
  title: string;
  content: string;
}

function getMockNoteAiResult(input: GenerateNoteAiInput): NoteAiResult {
  const firstSentence = input.content.split(/[.!?]/)[0]?.trim();

  return {
    summary:
      firstSentence ||
      `Local mock summary for "${input.title}". Add GEMINI_API_KEY to generate AI output.`,
    action_items: [
      "Review the note details",
      "Identify the next concrete step",
      "Update the note after progress is made"
    ],
    suggested_title: input.title || "Untitled note",
    usedMock: true
  };
}

function parseGeminiJson(text: string): Omit<NoteAiResult, "usedMock"> {
  const trimmedText = text.trim();
  const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const unfencedMatch = trimmedText.match(/\{[\s\S]*\}/);
  const jsonText = (fencedMatch?.[1] ?? unfencedMatch?.[0] ?? trimmedText).trim();
  const parsed = JSON.parse(jsonText) as {
    summary?: unknown;
    action_items?: unknown;
    suggested_title?: unknown;
  };

  if (
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.action_items) ||
    parsed.action_items.some((item) => typeof item !== "string") ||
    typeof parsed.suggested_title !== "string"
  ) {
    throw new Error("Gemini response did not match the expected note AI schema");
  }

  return normalizeNoteAiResult(parsed.summary, parsed.action_items, parsed.suggested_title);
}

function buildNoteAiPrompt(input: GenerateNoteAiInput) {
  return `
You are an assistant inside a productivity notes app.
Generate useful note intelligence from the user's note.
Return only valid JSON with:
- "summary": a concise 1-3 sentence summary
- "action_items": 0-5 concrete next steps as strings
- "suggested_title": a clear short title

Note title: ${input.title}
Note content:
${input.content}
`;
}

export async function generateNoteAi(input: GenerateNoteAiInput): Promise<NoteAiResult> {
  const prompt = buildNoteAiPrompt(input);
  const providerErrors: string[] = [];

  if (isGeminiConfigured()) {
    try {
      const parsed = parseGeminiJson(
        await generateGeminiText(prompt, {
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600
          },
          responseSchema: noteAiResponseSchema
        })
      );

      return {
        ...parsed,
        usedMock: false
      };
    } catch (error) {
      if (!shouldUseAiFallback(error)) {
        throw error;
      }

      providerErrors.push(formatProviderError("Gemini", error));
      console.warn(
        error instanceof Error
          ? `Gemini unavailable, trying NVIDIA fallback: ${error.message}`
          : "Gemini unavailable, trying NVIDIA fallback"
      );
    }
  }

  if (isNvidiaConfigured()) {
    try {
      const parsed = parseGeminiJson(
        await generateNvidiaText(prompt, {
          temperature: 0.2,
          maxTokens: 600
        })
      );

      return {
        ...parsed,
        usedMock: false
      };
    } catch (error) {
      if (!shouldUseAiFallback(error)) {
        throw error;
      }

      providerErrors.push(formatProviderError("NVIDIA", error));
      console.warn(
        error instanceof Error
          ? `NVIDIA AI unavailable, using local AI fallback: ${error.message}`
          : "NVIDIA AI unavailable, using local AI fallback"
      );
    }
  }

  if (providerErrors.length > 0) {
    console.warn(`Using local AI fallback after provider failures: ${providerErrors.join("; ")}`);
  }

  return getMockNoteAiResult(input);
}

function shouldUseAiFallback(error: unknown) {
  if (error instanceof HttpError) {
    return [429, 502].includes(error.statusCode);
  }

  return error instanceof Error;
}

function formatProviderError(provider: string, error: unknown) {
  return error instanceof Error ? `${provider}: ${error.message}` : `${provider}: unknown error`;
}

const noteAiResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING
    },
    action_items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING
      }
    },
    suggested_title: {
      type: SchemaType.STRING
    }
  },
  required: ["summary", "action_items", "suggested_title"]
};

function normalizeNoteAiResult(
  summary: unknown,
  actionItems: unknown,
  suggestedTitle: unknown
): Omit<NoteAiResult, "usedMock"> {
  if (
    typeof summary !== "string" ||
    !Array.isArray(actionItems) ||
    actionItems.some((item) => typeof item !== "string") ||
    typeof suggestedTitle !== "string"
  ) {
    throw new Error("Gemini response did not match the expected note AI schema");
  }

  return {
    summary: summary.trim(),
    action_items: actionItems
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 5),
    suggested_title: suggestedTitle.trim()
  };
}
