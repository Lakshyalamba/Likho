import type { Request, Response } from "express";
import { getPublicSharedNote } from "../services/note.service";
import { HttpError } from "../utils/http-error";

function validateShareId(shareId: string | undefined) {
  if (!shareId || shareId.trim().length === 0) {
    throw new HttpError(400, "Share id is required");
  }

  return shareId.trim();
}

export async function getSharedNote(req: Request, res: Response) {
  const shareId = validateShareId(req.params.shareId);
  const note = await getPublicSharedNote(shareId);

  res.json({ note });
}
