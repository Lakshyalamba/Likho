import { Router } from "express";
import { getProductivityInsights } from "../controllers/insights.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth } from "../middleware/auth";

export const insightsRouter = Router();

insightsRouter.get("/", requireAuth, asyncHandler(getProductivityInsights));
