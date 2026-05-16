import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { generateWithGemini } from "../services/gemini.service";
import { HttpError } from "../utils/http-error";

export async function generate(req: AuthenticatedRequest, res: Response) {
  const { prompt } = req.body as { prompt?: string };
  const normalizedPrompt = typeof prompt === "string" ? prompt.trim() : "";

  if (!normalizedPrompt) {
    throw new HttpError(400, "Prompt is required");
  }

  if (normalizedPrompt.length > 6000) {
    throw new HttpError(400, "Prompt must be 6000 characters or fewer");
  }

  const result = await generateWithGemini(normalizedPrompt);

  res.json({
    result
  });
}
