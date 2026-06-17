"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/contexts/toast-context";
import {
  archiveNote,
  createNote,
  deleteNote,
  generateNoteAi,
  getNotes,
  shareNote,
  unarchiveNote,
  unshareNote,
  updateNote,
  type Note,
  type PaginationMeta,
  type NotePayload
} from "@/lib/notes";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface NotesWorkspaceProps {
  token: string;
  userName: string;
  userEmail?: string;
  onLogout(): void;
}

interface DraftNote {
  title: string;
  content: string;
  tags: string;
  category: string;
}

function toDraft(note: Note): DraftNote {
  return {
    title: note.title,
    content: note.content,
    tags: note.tags.join(", "),
    category: note.category
  };
}

function toPayload(draft: DraftNote): NotePayload {
  return {
    title: draft.title.trim() || "Untitled note",
    content: draft.content.trim() || " ",
    tags: draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    category: draft.category.trim() || "General"
  };
}

export function NotesWorkspace({ token, userName, userEmail, onLogout }: NotesWorkspaceProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 1
  });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftNote>({
    title: "",
    content: "",
    tags: "",
    category: "General"
  });
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notePendingDelete, setNotePendingDelete] = useState<Note | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [shareError, setShareError] = useState("");
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(true);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );
  const selectedNoteRef = useRef<Note | null>(null);
  const selectedNoteIdRef = useRef<string | null>(null);
  const draftVersionRef = useRef(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  selectedNoteRef.current = selectedNote;
  selectedNoteIdRef.current = selectedNoteId;

  const tagOptions = useMemo(
    () => Array.from(new Set(notes.flatMap((note) => note.tags))).sort(),
    [notes]
  );

  const publicShareLink =
    typeof window !== "undefined" && selectedNote?.shareId
      ? `${window.location.origin}/shared/${selectedNote.shareId}`
      : "";

  const sortNotes = useCallback(
    (items: Note[]) =>
      [...items].sort((first, second) =>
        sort === "desc"
          ? new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
          : new Date(first.updatedAt).getTime() - new Date(second.updatedAt).getTime()
      ),
    [sort]
  );

  const replaceNote = useCallback(
    (updatedNote: Note) => {
      setNotes((currentNotes) =>
        sortNotes(currentNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
      );
    },
    [sortNotes]
  );

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const loadedNotes = await getNotes(token, {
        search,
        tag: tagFilter,
        archived: showArchived,
        sort,
        page,
        limit: 100
      });

      setNotes(loadedNotes.notes);
      setPagination(
        loadedNotes.pagination ?? {
          page,
          limit: 100,
          total: loadedNotes.notes.length,
          totalPages: 1
        }
      );
      setSelectedNoteId((currentId) => {
        if (currentId && loadedNotes.notes.some((note) => note.id === currentId)) {
          return currentId;
        }

        return loadedNotes.notes[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, showArchived, sort, tagFilter, token]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    setPage(1);
  }, [search, showArchived, sort, tagFilter]);

  useEffect(() => {
    function handleKeyboardShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, []);

  useEffect(() => {
    const note = selectedNoteRef.current;

    if (!note) {
      setDraft({
        title: "",
        content: "",
        tags: "",
        category: "General"
      });
      setIsDirty(false);
      setSaveStatus("idle");
      return;
    }

    draftVersionRef.current = 0;
    setDraft(toDraft(note));
    setIsDirty(false);
    setSaveStatus("saved");
  }, [selectedNoteId]);

  const saveDraftRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (!selectedNote || !isDirty) {
      return;
    }

    setSaveStatus("saving");

    const noteId = selectedNote.id;
    const saveVersion = draftVersionRef.current;
    const timeoutId = window.setTimeout(() => {
      updateNote(token, noteId, toPayload(draft))
        .then((updatedNote) => {
          if (
            selectedNoteIdRef.current === noteId &&
            draftVersionRef.current === saveVersion
          ) {
            replaceNote(updatedNote);
            setSaveStatus("saved");
            setIsDirty(false);
          }
        })
        .catch((err) => {
          if (selectedNoteIdRef.current === noteId) {
            setSaveStatus("error");
          }
          setError(err instanceof Error ? err.message : "Unable to save note");
        });
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [draft, isDirty, replaceNote, selectedNote, token]);

  saveDraftRef.current = async () => {
    if (!selectedNote || !isDirty) return;
    try {
      const updatedNote = await updateNote(token, selectedNote.id, toPayload(draft));
      replaceNote(updatedNote);
      setIsDirty(false);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const handleNoteSwitch = useCallback(async (noteId: string | null) => {
    if (selectedNoteRef.current && isDirty) {
      await saveDraftRef.current();
    }
    setSelectedNoteId(noteId);
  }, [isDirty]);

  async function handleCreateNote() {
    setIsCreating(true);
    setError("");

    try {
      const note = await createNote(token);
      setNotes((currentNotes) => [note, ...currentNotes]);
      setPagination((currentPagination) => ({
        ...currentPagination,
        total: currentPagination.total + 1
      }));
      setSelectedNoteId(note.id);
      if (showArchived) {
        setShowArchived(false);
      }
      showToast({ title: "Note created", description: "Start writing and changes will autosave.", type: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create note";
      setError(message);
      showToast({ title: "Could not create note", description: message, type: "error" });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleArchiveToggle() {
    if (!selectedNote) {
      return;
    }

    setError("");

    try {
      if (selectedNote.archived) {
        await unarchiveNote(token, selectedNote.id);
      } else {
        await archiveNote(token, selectedNote.id);
      }

      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== selectedNote.id));
      setSelectedNoteId((currentId) => {
        const remainingNotes = notes.filter((note) => note.id !== selectedNote.id);
        return currentId === selectedNote.id ? remainingNotes[0]?.id ?? null : currentId;
      });
      showToast({
        title: selectedNote.archived ? "Note restored" : "Note archived",
        type: "success"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update note archive status";
      setError(message);
      showToast({ title: "Archive update failed", description: message, type: "error" });
    }
  }

  async function handleDeleteNote() {
    if (!notePendingDelete || isDeleting) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      await deleteNote(token, notePendingDelete.id);

      const remainingNotes = notes.filter((note) => note.id !== notePendingDelete.id);
      setNotes(remainingNotes);
      setPagination((currentPagination) => {
        const nextTotal = Math.max(0, currentPagination.total - 1);
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / currentPagination.limit));

        return {
          ...currentPagination,
          total: nextTotal,
          totalPages: nextTotalPages,
          page: Math.min(currentPagination.page, nextTotalPages)
        };
      });
      setSelectedNoteId((currentId) =>
        currentId === notePendingDelete.id ? remainingNotes[0]?.id ?? null : currentId
      );

      if (remainingNotes.length === 0 && page > 1) {
        setPage((currentPage) => Math.max(1, currentPage - 1));
      }

      showToast({ title: "Note deleted", type: "success" });
      setNotePendingDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete note";
      setError(message);
      showToast({ title: "Delete failed", description: message, type: "error" });
    } finally {
      setIsDeleting(false);
    }
  }

  function updateDraft(field: keyof DraftNote, value: string) {
    draftVersionRef.current += 1;
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
    setIsDirty(true);
  }

  async function handleGenerateAi() {
    if (!selectedNote) {
      return;
    }

    setAiError("");
    setError("");
    setIsGeneratingAi(true);

    try {
      let noteForAi = selectedNote;

      if (isDirty) {
        setSaveStatus("saving");
        const saveVersion = draftVersionRef.current;
        noteForAi = await updateNote(token, selectedNote.id, toPayload(draft));
        replaceNote(noteForAi);

        if (
          selectedNoteIdRef.current === selectedNote.id &&
          draftVersionRef.current === saveVersion
        ) {
          setIsDirty(false);
          setSaveStatus("saved");
        }
      }

      const result = await generateNoteAi(token, noteForAi.id);
      replaceNote(result.note);
      showToast({
        title: result.ai.usedMock ? "Fallback summary generated" : "AI summary generated",
        description: result.ai.usedMock
          ? "Gemini is unavailable, so Likho used its local fallback response."
          : "Summary and action items are ready.",
        type: "success"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate AI summary";
      setAiError(message);
      showToast({ title: "AI generation failed", description: message, type: "error" });
    } finally {
      setIsGeneratingAi(false);
    }
  }

  function handleApplySuggestedTitle() {
    if (!selectedNote?.suggestedTitle) {
      return;
    }

    updateDraft("title", selectedNote.suggestedTitle);
  }

  async function handleShareNote() {
    if (!selectedNote) {
      return;
    }

    setShareError("");
    setCopiedShareLink(false);
    setIsSharing(true);

    try {
      const updatedNote = await shareNote(token, selectedNote.id);
      replaceNote(updatedNote);
      showToast({ title: "Public link created", type: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to share note";
      setShareError(message);
      showToast({ title: "Share failed", description: message, type: "error" });
    } finally {
      setIsSharing(false);
    }
  }

  async function handleUnshareNote() {
    if (!selectedNote) {
      return;
    }

    setShareError("");
    setCopiedShareLink(false);
    setIsSharing(true);

    try {
      const updatedNote = await unshareNote(token, selectedNote.id);
      replaceNote(updatedNote);
      showToast({ title: "Note is private", type: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to unshare note";
      setShareError(message);
      showToast({ title: "Unshare failed", description: message, type: "error" });
    } finally {
      setIsSharing(false);
    }
  }

  async function handleCopyShareLink() {
    if (!publicShareLink) {
      return;
    }

    setShareError("");

    try {
      await navigator.clipboard.writeText(publicShareLink);
      setCopiedShareLink(true);
      showToast({ title: "Link copied", type: "success" });
      window.setTimeout(() => setCopiedShareLink(false), 1800);
    } catch {
      setShareError("Unable to copy link. Select and copy it manually.");
      showToast({
        title: "Copy failed",
        description: "Select and copy the link manually.",
        type: "error"
      });
    }
  }

  return (
    <AppShell
      userName={userName}
      userEmail={userEmail}
      onLogout={onLogout}
      onNewNote={handleCreateNote}
      isCreatingNote={isCreating}
    >
      <section
        className={`grid min-h-screen gap-4 px-4 py-4 sm:px-6 lg:px-8 ${
          isNotesSidebarOpen ? "lg:grid-cols-[320px_minmax(0,1fr)]" : "lg:grid-cols-1"
        }`}
      >
        {isNotesSidebarOpen ? (
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-5.5rem)]">
          <div className="space-y-4 border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Workspace
                </p>
                <h2 className="truncate text-base font-semibold text-slate-950 dark:text-slate-50">
                  Notes
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsNotesSidebarOpen(false)}
                className="flex h-8 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Hide
              </button>
            </div>
            <button
              type="button"
              onClick={handleCreateNote}
              disabled={isCreating}
              className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              {isCreating ? "Creating..." : "Create note"}
            </button>

            <div className="grid gap-3">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  View
                </span>
                <div className="mt-2 grid grid-cols-2 rounded-md border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setShowArchived(false)}
                    className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                      !showArchived
                        ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-50"
                        : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-50"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowArchived(true)}
                    className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                      showArchived
                        ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-50"
                        : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-50"
                    }`}
                  >
                    Archived
                  </button>
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Search
                </span>
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, content, tags"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-300/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Tag
                  </span>
                  <select
                    value={tagFilter}
                    onChange={(event) => setTagFilter(event.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-300/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                  >
                    <option value="">All tags</option>
                    {tagOptions.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Sort
                  </span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as "desc" | "asc")}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-300/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                  >
                    <option value="desc">Recently updated</option>
                    <option value="asc">Oldest updated</option>
                  </select>
                </label>
              </div>

              {(search || tagFilter) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setTagFilter("");
                  }}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Clear search and filters
                </button>
              ) : null}
            </div>
          </div>

          <div className="max-h-[48vh] overflow-y-auto dark:border-slate-800 lg:max-h-[calc(100vh-390px)]">
            {isLoading ? (
              <div className="grid gap-1 p-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="rounded-lg px-3 py-2">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="p-6 text-sm leading-6 text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {showArchived ? "No archived notes found" : "No notes found"}
                </p>
                <p className="mt-1">
                  {showArchived
                    ? "Switch to Active notes or clear search and filters."
                    : "Create a note, clear search, or adjust your filters."}
                </p>
              </div>
            ) : (
              <div>
                <div className="p-2">
                    {notes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => void handleNoteSwitch(note.id)}
                      className={`mb-1 flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-lg px-3 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        selectedNoteId === note.id
                          ? "bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-slate-50"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="min-w-0 truncate font-medium">
                        {note.title || "Untitled note"}
                      </span>
                      {note.archived ? (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
                          Archived
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>

                {pagination.totalPages > 1 ? (
                  <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                      disabled={pagination.page <= 1}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Previous
                    </button>
                    <span className="text-slate-600 dark:text-slate-300">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1))
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </aside>
        ) : null}

        <section className="min-h-[560px]">
          {!isNotesSidebarOpen ? (
            <button
              type="button"
              onClick={() => setIsNotesSidebarOpen(true)}
              className="mb-4 flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Show notes
            </button>
          ) : null}

          {error ? (
            <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {selectedNote ? (
            <div className="flex h-full min-h-[calc(100vh-2rem)] flex-col rounded-2xl border border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      saveStatus === "saving"
                        ? "bg-amber-500"
                        : saveStatus === "error"
                          ? "bg-red-500"
                          : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {saveStatus === "saving"
                      ? "Saving"
                      : saveStatus === "error"
                        ? "Save failed"
                        : "Saved"}
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={selectedNote.isPublic ? handleUnshareNote : handleShareNote}
                    disabled={isSharing}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {isSharing
                      ? "Updating..."
                      : selectedNote.isPublic
                        ? "Unshare"
                        : "Share"}
                  </button>
                  <button
                    type="button"
                    onClick={handleArchiveToggle}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {selectedNote.archived ? "Unarchive note" : "Archive note"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotePendingDelete(selectedNote)}
                    disabled={isDeleting}
                    className="h-9 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300 dark:border-red-900/60 dark:bg-slate-950 dark:text-red-300 dark:hover:bg-red-950/30"
                  >
                    Delete note
                  </button>
                </div>
              </div>

              <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">Public sharing</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {selectedNote.isPublic
                          ? "Anyone with this link can read the public version of this note."
                          : "Create a public read-only link for this note."}
                      </p>
                    </div>
                    {selectedNote.isPublic && publicShareLink ? (
                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="h-9 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                      >
                        {copiedShareLink ? "Copied" : "Copy link"}
                      </button>
                    ) : null}
                  </div>

                  {selectedNote.isPublic && publicShareLink ? (
                    <div className="mt-3 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2">
                      <p className="truncate text-sm text-slate-700 dark:text-slate-200">{publicShareLink}</p>
                    </div>
                  ) : null}

                  {shareError ? (
                    <p className="mt-3 text-sm text-red-700">{shareError}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 border-b border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-[1fr_220px] sm:p-6">
                <label className="min-w-0">
                  <span className="sr-only">Note title</span>
                  <input
                    value={draft.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                    placeholder="Note title"
                    className="min-w-0 border-0 bg-transparent text-4xl font-semibold tracking-normal text-slate-950 outline-none placeholder:text-slate-300 dark:text-slate-50 sm:text-5xl"
                  />
                </label>
                <label>
                  <span className="sr-only">Category</span>
                  <input
                    value={draft.category}
                    onChange={(event) => updateDraft("category", event.target.value)}
                    placeholder="Category"
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-300/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                  />
                </label>
              </div>

              <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Tags
                  </span>
                  <input
                    value={draft.tags}
                    onChange={(event) => updateDraft("tags", event.target.value)}
                    placeholder="work, ideas, meeting"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-300/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
                  />
                </label>
              </div>

              <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60 sm:px-6">
                <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">AI assistant</h2>
                      <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                        Generate a summary, action items, and a cleaner title from this note.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateAi}
                      disabled={isGeneratingAi}
                      className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                    >
                      {isGeneratingAi ? "Generating..." : "Generate AI Summary"}
                    </button>
                  </div>

                  {aiError ? (
                    <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {aiError}
                    </div>
                  ) : null}

                  {isGeneratingAi ? (
                    <div className="grid gap-3 px-4 py-4 sm:grid-cols-3">
                      <div className="h-20 rounded-md bg-slate-100 dark:bg-slate-800" />
                      <div className="h-20 rounded-md bg-slate-100 dark:bg-slate-800" />
                      <div className="h-20 rounded-md bg-slate-100 dark:bg-slate-800" />
                    </div>
                  ) : selectedNote.aiSummary ||
                    selectedNote.actionItems.length > 0 ||
                    selectedNote.suggestedTitle ? (
                    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1.2fr_1fr]">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Summary
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                          {selectedNote.aiSummary ?? "No summary generated yet."}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Suggested title
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {selectedNote.suggestedTitle ?? "No title suggestion yet."}
                            </p>
                          </div>
                          {selectedNote.suggestedTitle ? (
                            <button
                              type="button"
                              onClick={handleApplySuggestedTitle}
                              className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                            >
                              Apply
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 lg:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action items
                        </p>
                        {selectedNote.actionItems.length > 0 ? (
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {selectedNote.actionItems.map((item) => (
                              <li
                                key={item}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            No action items generated yet.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      AI results will appear here after generation.
                    </div>
                  )}
                </div>
              </div>

              <textarea
                value={draft.content}
                onChange={(event) => updateDraft("content", event.target.value)}
                placeholder="Start writing..."
                className="min-h-[420px] flex-1 resize-none rounded-b-2xl border-0 bg-white p-4 text-base leading-8 text-slate-800 outline-none placeholder:text-slate-300 dark:bg-slate-900 dark:text-slate-100 sm:p-6"
              />
            </div>
          ) : (
            <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/90 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">No note selected</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Create a note or choose one from the sidebar to begin editing.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>

      {notePendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setNotePendingDelete(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-300">
              Delete note
            </p>
            <h2 id="delete-modal-title" className="mt-3 text-xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">
              Delete &ldquo;{notePendingDelete.title}&rdquo;?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This permanently removes the note and its AI results. This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setNotePendingDelete(null)}
                disabled={isDeleting}
                className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNote}
                disabled={isDeleting}
                className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isDeleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
