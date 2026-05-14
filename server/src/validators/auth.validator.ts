import { HttpError } from "../utils/http-error";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required`);
  }

  return value.trim();
}

export function validateSignupBody(body: unknown) {
  const payload = body as Record<string, unknown>;
  const name = requireString(payload.name, "Name");
  const email = requireString(payload.email, "Email").toLowerCase();
  const password = requireString(payload.password, "Password");

  if (name.length < 2) {
    throw new HttpError(400, "Name must be at least 2 characters long");
  }

  if (!emailRegex.test(email)) {
    throw new HttpError(400, "Email must be valid");
  }

  if (password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters long");
  }

  return {
    name,
    email,
    password
  };
}

export function validateLoginBody(body: unknown) {
  const payload = body as Record<string, unknown>;
  const email = requireString(payload.email, "Email").toLowerCase();
  const password = requireString(payload.password, "Password");

  if (!emailRegex.test(email)) {
    throw new HttpError(400, "Email must be valid");
  }

  return {
    email,
    password
  };
}
