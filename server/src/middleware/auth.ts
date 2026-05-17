import type { NextFunction, Request, Response } from "express";
import type { AuthUser } from "../services/auth.service";
import { prisma } from "../config/prisma";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
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
      res.status(401).json({
        success: false,
        message: "Authentication token is required"
      });
      return;
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}
