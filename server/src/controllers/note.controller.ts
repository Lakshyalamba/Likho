import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import {
  createNote,
  deleteNote,
  generateAiForNote,
  getNoteById,
  listNotes,
  shareNote,
  setNoteArchived,
  unshareNote,
  updateNote
} from "../services/note.service";
import { HttpError } from "../utils/http-error";
import {
  validateCreateNoteBody,
  validateNoteId,
  validateNoteListQuery,
  validateUpdateNoteBody
} from "../validators/note.validator";

function getAuthenticatedUserId(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  return req.user.id;
}

export async function getNotes(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const query = validateNoteListQuery(req.query);
  const result = await listNotes(userId, query);

  res.json(result);
}

export async function postNote(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const payload = validateCreateNoteBody(req.body);
  const note = await createNote(userId, payload);

  res.status(201).json({ note });
}

export async function getNote(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const noteId = validateNoteId(req.params.id);
  const note = await getNoteById(userId, noteId);

  res.json({ note });
}

export async function patchNote(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const noteId = validateNoteId(req.params.id);
  const payload = validateUpdateNoteBody(req.body);
  const note = await updateNote(userId, noteId, payload);

  res.json({ note });
}

export async function deleteNoteById(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const noteId = validateNoteId(req.params.id);

  await deleteNote(userId, noteId);

  res.status(204).send();
}

export async function archiveNote(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const noteId = validateNoteId(req.params.id);
  const archived =
    typeof req.body === "object" &&
    req.body !== null &&
    "archived" in req.body &&
    typeof req.body.archived === "boolean"
      ? req.body.archived
      : true;
  const note = await setNoteArchived(userId, noteId, archived);

  res.json({ note });
}

export async function generateNoteAiResult(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const noteId = validateNoteId(req.params.id);
  const result = await generateAiForNote(userId, noteId);

  res.json(result);
}

export async function shareNoteById(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const noteId = validateNoteId(req.params.id);
  const note = await shareNote(userId, noteId);

  res.json({ note });
}

export async function unshareNoteById(req: AuthenticatedRequest, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const noteId = validateNoteId(req.params.id);
  const note = await unshareNote(userId, noteId);

  res.json({ note });
}
