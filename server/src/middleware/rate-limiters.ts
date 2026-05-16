import rateLimit from "express-rate-limit";

function createJsonRateLimiter(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message
    }
  });
}

export const authRateLimiter = createJsonRateLimiter(
  15 * 60 * 1000,
  30,
  "Too many authentication attempts. Please try again later."
);

export const aiRateLimiter = createJsonRateLimiter(
  60 * 1000,
  10,
  "Too many AI generation requests. Please wait a moment and try again."
);
