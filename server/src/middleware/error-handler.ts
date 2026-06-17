import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
}
