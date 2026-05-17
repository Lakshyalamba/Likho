import { randomUUID } from "crypto";
import type { Note, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { generateNoteAi } from "./ai.service";
import { HttpError } from "../utils/http-error";
import type {
  CreateNoteInput,
  NoteListQuery,
  UpdateNoteInput
} from "../validators/note.validator";

export function serializeNote(note: Note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags,
    category: note.category,
    archived: note.archived,
    isPublic: note.isPublic,
    shareId: note.shareId ?? undefined,
    aiSummary: note.aiSummary ?? undefined,
    actionItems: note.actionItems,
    suggestedTitle: note.suggestedTitle ?? undefined,
    aiUsageCount: note.aiUsageCount,
    userId: note.userId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
}

export function serializePublicNote(note: Note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags,
    category: note.category,
    shareId: note.shareId,
    aiSummary: note.aiSummary ?? undefined,
    actionItems: note.actionItems,
    suggestedTitle: note.suggestedTitle ?? undefined,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
}

function buildOwnedNoteFilter(userId: string, query?: NoteListQuery) {
  const filter: Prisma.NoteWhereInput = {
    userId
  };

  if (!query) {
    return filter;
  }

  if (query.archived !== undefined) {
    filter.archived = query.archived;
  }

  if (query.tag) {
    filter.tags = {
      has: query.tag
    };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    filter.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { content: { contains: query.search, mode: "insensitive" } },
      { tags: { has: query.search } },
      { category: { contains: query.search, mode: "insensitive" } }
    ];
  }

  return filter;
}

export async function listNotes(userId: string, query: NoteListQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const filter = buildOwnedNoteFilter(userId, query);
  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where: filter,
      orderBy: {
        updatedAt: query.sort === 1 ? "asc" : "desc"
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.note.count({
      where: filter
    })
  ]);

  return {
    notes: notes.map(serializeNote),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function createNote(userId: string, input: CreateNoteInput) {
  const note = await prisma.note.create({
    data: {
      title: input.title,
      content: input.content,
      tags: input.tags ?? [],
      category: input.category ?? "General",
      archived: input.archived ?? false,
      userId
    }
  });

  return serializeNote(note);
}

export async function getNoteById(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId
    }
  });

  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  return serializeNote(note);
}

export async function updateNote(userId: string, noteId: string, input: UpdateNoteInput) {
  await assertOwnedNote(userId, noteId);

  const note = await prisma.note.update({
    where: {
      id: noteId
    },
    data: input
  });

  return serializeNote(note);
}

export async function deleteNote(userId: string, noteId: string) {
  await assertOwnedNote(userId, noteId);

  await prisma.note.delete({
    where: {
      id: noteId
    }
  });
}

export async function setNoteArchived(userId: string, noteId: string, archived: boolean) {
  return updateNote(userId, noteId, { archived });
}

export async function generateAiForNote(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId
    }
  });

  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  const aiResult = await generateNoteAi({
    title: note.title,
    content: note.content
  });

  const updatedNote = await prisma.note.update({
    where: {
      id: note.id
    },
    data: {
      aiSummary: aiResult.summary,
      actionItems: aiResult.action_items,
      suggestedTitle: aiResult.suggested_title,
      aiUsageCount: {
        increment: 1
      }
    }
  });

  return {
    note: serializeNote(updatedNote),
    ai: aiResult
  };
}

async function createUniqueShareId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shareId = randomUUID();
    const existingNote = await prisma.note.findUnique({
      where: {
        shareId
      },
      select: {
        id: true
      }
    });

    if (!existingNote) {
      return shareId;
    }
  }

  throw new HttpError(500, "Unable to generate a unique share id");
}

export async function shareNote(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId
    }
  });

  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  const updatedNote = await prisma.note.update({
    where: {
      id: note.id
    },
    data: {
      shareId: note.shareId ?? (await createUniqueShareId()),
      isPublic: true
    }
  });

  return serializeNote(updatedNote);
}

export async function unshareNote(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId
    }
  });

  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  const updatedNote = await prisma.note.update({
    where: {
      id: note.id
    },
    data: {
      isPublic: false
    }
  });

  return serializeNote(updatedNote);
}

export async function getPublicSharedNote(shareId: string) {
  const note = await prisma.note.findFirst({
    where: {
      shareId,
      isPublic: true
    }
  });

  if (!note) {
    throw new HttpError(404, "Shared note not found");
  }

  return serializePublicNote(note);
}

async function assertOwnedNote(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId
    },
    select: {
      id: true
    }
  });

  if (!note) {
    throw new HttpError(404, "Note not found");
  }
}
