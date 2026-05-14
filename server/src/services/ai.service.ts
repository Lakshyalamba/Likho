import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

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
  const jsonText = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
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

  return {
    summary: parsed.summary,
    action_items: parsed.action_items,
    suggested_title: parsed.suggested_title
  };
}

export async function generateNoteAi(input: GenerateNoteAiInput): Promise<NoteAiResult> {
  if (!env.geminiApiKey || env.geminiApiKey.startsWith("replace-with")) {
    return getMockNoteAiResult(input);
  }

  const prompt = `
Generate note intelligence as strict JSON.
Return only:
{
  "summary": "brief summary",
  "action_items": ["task 1", "task 2"],
  "suggested_title": "short title"
}

Note title: ${input.title}
Note content:
${input.content}
`;

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const parsed = parseGeminiJson(result.response.text());

  return {
    ...parsed,
    usedMock: false
  };
}
