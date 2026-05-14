import { Router } from "express";
import {
  archiveNote,
  deleteNoteById,
  generateNoteAiResult,
  getNote,
  getNotes,
  patchNote,
  postNote,
  shareNoteById,
  unshareNoteById
} from "../controllers/note.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth } from "../middleware/auth";

export const noteRouter = Router();

noteRouter.use(requireAuth);

noteRouter.get("/", asyncHandler(getNotes));
noteRouter.post("/", asyncHandler(postNote));
noteRouter.patch("/:id/archive", asyncHandler(archiveNote));
noteRouter.post("/:id/generate-ai", asyncHandler(generateNoteAiResult));
noteRouter.post("/:id/share", asyncHandler(shareNoteById));
noteRouter.patch("/:id/unshare", asyncHandler(unshareNoteById));
noteRouter.get("/:id", asyncHandler(getNote));
noteRouter.patch("/:id", asyncHandler(patchNote));
noteRouter.delete("/:id", asyncHandler(deleteNoteById));
