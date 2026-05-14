import { Router } from "express";
import { generate } from "../controllers/gemini.controller";
import { requireAuth } from "../middleware/auth";

export const geminiRouter = Router();

geminiRouter.post("/generate", requireAuth, generate);
