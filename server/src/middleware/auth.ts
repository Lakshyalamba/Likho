import type { NextFunction, Request, Response } from "express";
import { UserModel, type UserDocument } from "../models/user.model";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ message: "Authentication token is required" });
      return;
    }

    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
