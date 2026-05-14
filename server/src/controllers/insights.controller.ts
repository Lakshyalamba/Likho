import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { getInsights } from "../services/insights.service";
import { HttpError } from "../utils/http-error";

function getAuthenticatedUserId(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  return String(req.user._id);
}

export async function getProductivityInsights(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const insights = await getInsights(userId);

  res.json(insights);
}
