import { apiRequest } from "@/lib/api";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  archived: boolean;
  isPublic: boolean;
  shareId?: string;
  aiSummary?: string;
  actionItems: string[];
  suggestedTitle?: string;
  aiUsageCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteListParams {
  search?: string;
  tag?: string;
  archived?: boolean;
  sort?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface NotePayload {
  title: string;
  content: string;
  tags: string[];
  category: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NoteListResponse {
  notes: Note[];
  pagination?: PaginationMeta;
}

export interface NoteAiResponse {
  note: Note;
  ai: {
    summary: string;
    action_items: string[];
    suggested_title: string;
    usedMock: boolean;
  };
}

export interface PublicNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  shareId: string;
  aiSummary?: string;
  actionItems: string[];
  suggestedTitle?: string;
  createdAt: string;
  updatedAt: string;
}

function buildQuery(params: NoteListParams) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.tag) query.set("tag", params.tag);
  if (params.archived !== undefined) query.set("archived", String(params.archived));
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getNotes(token: string, params: NoteListParams) {
  return apiRequest<NoteListResponse>(`/notes${buildQuery(params)}`, {
    token
  });
}

export async function createNote(token: string) {
  const response = await apiRequest<{ note: Note }>("/notes", {
    method: "POST",
    token,
    body: JSON.stringify({
      title: "Untitled note",
      content: "",
      tags: [],
      category: "General"
    })
  });

  return response.note;
}

export async function updateNote(token: string, noteId: string, payload: NotePayload) {
  const response = await apiRequest<{ note: Note }>(`/notes/${noteId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });

  return response.note;
}

export async function deleteNote(token: string, noteId: string) {
  await apiRequest<void>(`/notes/${noteId}`, {
    method: "DELETE",
    token
  });
}

export async function archiveNote(token: string, noteId: string) {
  return setNoteArchived(token, noteId, true);
}

export async function unarchiveNote(token: string, noteId: string) {
  return setNoteArchived(token, noteId, false);
}

async function setNoteArchived(token: string, noteId: string, archived: boolean) {
  const response = await apiRequest<{ note: Note }>(`/notes/${noteId}/archive`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ archived })
  });

  return response.note;
}

export async function generateNoteAi(token: string, noteId: string) {
  return apiRequest<NoteAiResponse>(`/notes/${noteId}/generate-ai`, {
    method: "POST",
    token
  });
}

export async function shareNote(token: string, noteId: string) {
  const response = await apiRequest<{ note: Note }>(`/notes/${noteId}/share`, {
    method: "POST",
    token
  });

  return response.note;
}

export async function unshareNote(token: string, noteId: string) {
  const response = await apiRequest<{ note: Note }>(`/notes/${noteId}/unshare`, {
    method: "PATCH",
    token
  });

  return response.note;
}

export async function getSharedNote(shareId: string) {
  const response = await apiRequest<{ note: PublicNote }>(`/shared/${shareId}`);

  return response.note;
}
