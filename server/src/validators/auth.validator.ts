import { HttpError } from "../utils/http-error";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required`);
  }

  return value.trim();
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Request body must be an object");
  }

  return value as Record<string, unknown>;
}

export function validateSignupBody(body: unknown) {
  const payload = asRecord(body);
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
  const payload = asRecord(body);
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
