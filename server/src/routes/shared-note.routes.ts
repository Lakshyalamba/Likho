import { Router } from "express";
import { getSharedNote } from "../controllers/shared-note.controller";
import { asyncHandler } from "../middleware/async-handler";

export const sharedNoteRouter = Router();

sharedNoteRouter.get("/:shareId", asyncHandler(getSharedNote));
