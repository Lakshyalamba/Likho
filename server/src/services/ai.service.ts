import { SchemaType, type ResponseSchema } from "@google/generative-ai";
import { generateGeminiText, isGeminiConfigured } from "./gemini.service";
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

export async function generateNoteAi(input: GenerateNoteAiInput): Promise<NoteAiResult> {
  if (!isGeminiConfigured()) {
    return getMockNoteAiResult(input);
  }

  const prompt = `
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

  let parsed: Omit<NoteAiResult, "usedMock">;

  try {
    parsed = parseGeminiJson(
      await generateGeminiText(prompt, {
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600
        },
        responseSchema: noteAiResponseSchema
      })
    );
  } catch (error) {
    if (shouldUseAiFallback(error)) {
      console.warn(
        error instanceof Error
          ? `Gemini unavailable, using local AI fallback: ${error.message}`
          : "Gemini unavailable, using local AI fallback"
      );
      return getMockNoteAiResult(input);
    }

    throw error;
  }

  return {
    ...parsed,
    usedMock: false
  };
}

function shouldUseAiFallback(error: unknown) {
  if (error instanceof HttpError) {
    return [429, 502].includes(error.statusCode);
  }

  return error instanceof Error;
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
