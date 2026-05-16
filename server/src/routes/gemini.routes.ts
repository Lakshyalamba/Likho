import { Router } from "express";
import { generate } from "../controllers/gemini.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth } from "../middleware/auth";

export const geminiRouter = Router();

geminiRouter.post("/generate", requireAuth, asyncHandler(generate));
