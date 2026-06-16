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

const usernameRegex = /^[a-zA-Z0-9_-]+$/;

function optionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new HttpError(400, "Invalid value type");
  }
  return value.trim();
}

export function validateUpdateProfileBody(body: unknown) {
  const payload = asRecord(body);

  if (Object.keys(payload).length === 0) {
    throw new HttpError(400, "No fields to update");
  }

  const name = optionalString(payload.name);
  const username = optionalString(payload.username);
  const bio = optionalString(payload.bio);

  if (name !== undefined && name !== null && name.length < 2) {
    throw new HttpError(400, "Name must be at least 2 characters long");
  }

  if (username !== undefined && username !== null) {
    if (username.length < 2) {
      throw new HttpError(400, "Username must be at least 2 characters long");
    }
    if (!usernameRegex.test(username)) {
      throw new HttpError(400, "Username can only contain letters, numbers, underscores, and hyphens");
    }
  }

  if (bio !== undefined && bio !== null && bio.length > 500) {
    throw new HttpError(400, "Bio must be under 500 characters");
  }

  return {
    name: name ?? undefined,
    username: username === undefined ? undefined : username,
    bio: bio === undefined ? undefined : bio
  } as { name?: string; username?: string | null; bio?: string | null };
}
