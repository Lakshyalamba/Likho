import { randomUUID } from "crypto";
import { Types, type FilterQuery } from "mongoose";
import { NoteModel, type Note, type NoteDocument } from "../models/note.model";
import { generateNoteAi } from "./ai.service";
import { HttpError } from "../utils/http-error";
import type {
  CreateNoteInput,
  NoteListQuery,
  UpdateNoteInput
} from "../validators/note.validator";

export function serializeNote(note: NoteDocument) {
  return {
    id: String(note._id),
    title: note.title,
    content: note.content,
    tags: note.tags,
    category: note.category,
    archived: note.archived,
    isPublic: note.isPublic,
    shareId: note.shareId,
    aiSummary: note.aiSummary,
    actionItems: note.actionItems,
    suggestedTitle: note.suggestedTitle,
    aiUsageCount: note.aiUsageCount,
    userId: String(note.userId),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
}

export function serializePublicNote(note: NoteDocument) {
  return {
    id: String(note._id),
    title: note.title,
    content: note.content,
    tags: note.tags,
    category: note.category,
    shareId: note.shareId,
    aiSummary: note.aiSummary,
    actionItems: note.actionItems,
    suggestedTitle: note.suggestedTitle,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
}

function buildOwnedNoteFilter(userId: string, query?: NoteListQuery) {
  const filter: FilterQuery<Note> = {
    userId: new Types.ObjectId(userId)
  };

  if (!query) {
    return filter;
  }

  if (query.archived !== undefined) {
    filter.archived = query.archived;
  }

  if (query.tag) {
    filter.tags = query.tag;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { title: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
      { category: searchRegex }
    ];
  }

  return filter;
}

export async function listNotes(userId: string, query: NoteListQuery) {
  const notes = await NoteModel.find(buildOwnedNoteFilter(userId, query))
    .sort({ updatedAt: query.sort ?? -1 })
    .exec();

  return notes.map(serializeNote);
}

export async function createNote(userId: string, input: CreateNoteInput) {
  const note = await NoteModel.create({
    ...input,
    userId: new Types.ObjectId(userId)
  });

  return serializeNote(note);
}

export async function getNoteById(userId: string, noteId: string) {
  const note = await NoteModel.findOne(buildOwnedNoteFilter(userId, undefined))
    .where("_id")
    .equals(noteId)
    .exec();

  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  return serializeNote(note);
}

export async function updateNote(userId: string, noteId: string, input: UpdateNoteInput) {
  const note = await NoteModel.findOneAndUpdate(
    {
      ...buildOwnedNoteFilter(userId, undefined),
      _id: noteId
    },
    {
      $set: input
    },
    {
      new: true,
      runValidators: true
    }
  ).exec();

  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  return serializeNote(note);
}

export async function deleteNote(userId: string, noteId: string) {
  const note = await NoteModel.findOneAndDelete({
    ...buildOwnedNoteFilter(userId, undefined),
    _id: noteId
  }).exec();

  if (!note) {
    throw new HttpError(404, "Note not found");
  }
}

export async function setNoteArchived(userId: string, noteId: string, archived: boolean) {
  return updateNote(userId, noteId, { archived });
}

export async function generateAiForNote(userId: string, noteId: string) {
  const note = await NoteModel.findOne({
    ...buildOwnedNoteFilter(userId, undefined),
    _id: noteId
  }).exec();

  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  const aiResult = await generateNoteAi({
    title: note.title,
    content: note.content
  });

  note.aiSummary = aiResult.summary;
  note.actionItems = aiResult.action_items;
  note.suggestedTitle = aiResult.suggested_title;
  note.aiUsageCount = (note.aiUsageCount ?? 0) + 1;

  await note.save();

  return {
    note: serializeNote(note),
    ai: aiResult
  };
}

async function createUniqueShareId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shareId = randomUUID();
    const existingNote = await NoteModel.exists({ shareId });

    if (!existingNote) {
      return shareId;
    }
  }

  throw new HttpError(500, "Unable to generate a unique share id");
}

export async function shareNote(userId: string, noteId: string) {
  const note = await NoteModel.findOne({
    ...buildOwnedNoteFilter(userId, undefined),
    _id: noteId
  }).exec();

  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  if (!note.shareId) {
    note.shareId = await createUniqueShareId();
  }

  note.isPublic = true;
  await note.save();

  return serializeNote(note);
}

export async function unshareNote(userId: string, noteId: string) {
  const note = await NoteModel.findOne({
    ...buildOwnedNoteFilter(userId, undefined),
    _id: noteId
  }).exec();

  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  note.isPublic = false;
  await note.save();

  return serializeNote(note);
}

export async function getPublicSharedNote(shareId: string) {
  const note = await NoteModel.findOne({
    shareId,
    isPublic: true
  }).exec();

  if (!note) {
    throw new HttpError(404, "Shared note not found");
  }

  return serializePublicNote(note);
}
