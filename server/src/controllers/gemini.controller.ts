import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { generateWithGemini } from "../services/gemini.service";

export async function generate(req: AuthenticatedRequest, res: Response) {
  const { prompt } = req.body as { prompt?: string };

  if (!prompt) {
    res.status(400).json({ message: "Prompt is required" });
    return;
  }

  const result = await generateWithGemini(prompt);

  res.json({
    result
  });
}
