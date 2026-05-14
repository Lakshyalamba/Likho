import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { loginUser, serializeUser, signupUser } from "../services/auth.service";
import { validateLoginBody, validateSignupBody } from "../validators/auth.validator";

export async function signup(req: Request, res: Response) {
  const payload = validateSignupBody(req.body);
  const result = await signupUser(payload);

  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const payload = validateLoginBody(req.body);
  const result = await loginUser(payload);

  res.json(result);
}

export function me(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.json({
    user: serializeUser(req.user)
  });
}
