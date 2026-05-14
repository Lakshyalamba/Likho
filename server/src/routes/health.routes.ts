import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "fullstack_challenge_lakshya-api",
    timestamp: new Date().toISOString()
  });
});
