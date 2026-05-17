import { HttpError } from "../utils/http-error";

export interface NoteListQuery {
  search?: string;
  tag?: string;
  category?: string;
  archived?: boolean;
  sort?: 1 | -1;
  page?: number;
  limit?: number;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  tags?: string[];
  category?: string;
  archived?: boolean;
}

export type UpdateNoteInput = Partial<CreateNoteInput>;

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Request body must be an object");
  }

  return value as Record<string, unknown>;
}

function optionalString(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, `${field} must be a string`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requiredString(value: unknown, field: string) {
  const parsed = optionalString(value, field);

  if (!parsed) {
    throw new HttpError(400, `${field} is required`);
  }

  return parsed;
}

function requiredText(value: unknown, field: string) {
  if (typeof value !== "string") {
    throw new HttpError(400, `${field} is required`);
  }

  return value.trim();
}

function optionalStringArray(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new HttpError(400, `${field} must be an array of strings`);
  }

  return Array.from(
    new Set(
      value
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length > 0)
    )
  );
}

function optionalBoolean(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new HttpError(400, `${field} must be a boolean`);
  }

  return value;
}

function optionalPositiveInteger(value: unknown, field: string, max?: number) {
  if (value === undefined) {
    return undefined;
  }

  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = typeof rawValue === "string" ? Number(rawValue) : rawValue;

  if (!Number.isInteger(parsed) || Number(parsed) <= 0) {
    throw new HttpError(400, `${field} must be a positive integer`);
  }

  const numberValue = Number(parsed);

  if (max !== undefined && numberValue > max) {
    throw new HttpError(400, `${field} must be ${max} or less`);
  }

  return numberValue;
}

export function validateNoteId(id: string) {
  if (!id || typeof id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new HttpError(400, "Invalid note id");
  }

  return id;
}

export function validateCreateNoteBody(body: unknown): CreateNoteInput {
  const payload = asRecord(body);
  const input: CreateNoteInput = {
    title: requiredString(payload.title, "Title"),
    content: requiredText(payload.content, "Content")
  };

  const tags = optionalStringArray(payload.tags, "Tags");
  const category = optionalString(payload.category, "Category");
  const archived = optionalBoolean(payload.archived, "Archived");

  if (tags !== undefined) input.tags = tags;
  if (category !== undefined) input.category = category;
  if (archived !== undefined) input.archived = archived;

  return input;
}

export function validateUpdateNoteBody(body: unknown): UpdateNoteInput {
  const payload = asRecord(body);
  const update: UpdateNoteInput = {};
  const title = optionalString(payload.title, "Title");
  const content =
    payload.content === undefined ? undefined : requiredText(payload.content, "Content");
  const tags = optionalStringArray(payload.tags, "Tags");
  const category = optionalString(payload.category, "Category");
  const archived = optionalBoolean(payload.archived, "Archived");

  if (title !== undefined) update.title = title;
  if (content !== undefined) update.content = content;
  if (tags !== undefined) update.tags = tags;
  if (category !== undefined) update.category = category;
  if (archived !== undefined) update.archived = archived;

  if (Object.keys(update).length === 0) {
    throw new HttpError(400, "At least one note field is required");
  }

  return update;
}

export function validateNoteListQuery(query: Record<string, unknown>): NoteListQuery {
  const search = optionalString(query.search, "Search");
  const tag = optionalString(query.tag ?? query.tags, "Tag");
  const category = optionalString(query.category, "Category");
  const archivedValue = optionalString(query.archived, "Archived");
  const sortValue = optionalString(query.sort, "Sort");
  const page = optionalPositiveInteger(query.page, "Page");
  const limit = optionalPositiveInteger(query.limit, "Limit", 100);

  let archived: boolean | undefined;

  if (archivedValue !== undefined) {
    if (!["true", "false"].includes(archivedValue)) {
      throw new HttpError(400, "Archived must be true or false");
    }

    archived = archivedValue === "true";
  }

  let sort: 1 | -1 = -1;

  if (sortValue !== undefined) {
    if (!["asc", "desc"].includes(sortValue)) {
      throw new HttpError(400, "Sort must be asc or desc");
    }

    sort = sortValue === "asc" ? 1 : -1;
  }

  return {
    search,
    tag,
    category,
    archived,
    sort,
    page: page ?? 1,
    limit: limit ?? 20
  };
}
