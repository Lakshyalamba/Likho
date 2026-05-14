"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/contexts/toast-context";
import {
  archiveNote,
  createNote,
  generateNoteAi,
  getNotes,
  shareNote,
  unshareNote,
  updateNote,
  type Note,
  type NotePayload
} from "@/lib/notes";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface NotesWorkspaceProps {
  token: string;
  userName: string;
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

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function NotesWorkspace({ token, userName, onLogout }: NotesWorkspaceProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [shareError, setShareError] = useState("");
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );
  const selectedNoteRef = useRef<Note | null>(null);
  const selectedNoteIdRef = useRef<string | null>(null);
  const draftVersionRef = useRef(0);
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
        archived: false,
        sort
      });

      setNotes(loadedNotes);
      setSelectedNoteId((currentId) => {
        if (currentId && loadedNotes.some((note) => note.id === currentId)) {
          return currentId;
        }

        return loadedNotes[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [search, sort, tagFilter, token]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

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

    setDraft(toDraft(note));
    setIsDirty(false);
    setSaveStatus("saved");
  }, [selectedNoteId]);

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

  async function handleCreateNote() {
    setIsCreating(true);
    setError("");

    try {
      const note = await createNote(token);
      setNotes((currentNotes) => [note, ...currentNotes]);
      setSelectedNoteId(note.id);
      showToast({ title: "Note created", description: "Start writing and changes will autosave.", type: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create note";
      setError(message);
      showToast({ title: "Could not create note", description: message, type: "error" });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleArchiveNote() {
    if (!selectedNote) {
      return;
    }

    setError("");

    try {
      await archiveNote(token, selectedNote.id);
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== selectedNote.id));
      setSelectedNoteId((currentId) => {
        const remainingNotes = notes.filter((note) => note.id !== selectedNote.id);
        return currentId === selectedNote.id ? remainingNotes[0]?.id ?? null : currentId;
      });
      showToast({ title: "Note archived", type: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to archive note";
      setError(message);
      showToast({ title: "Archive failed", description: message, type: "error" });
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
        title: "AI summary generated",
        description: "Summary and action items are ready.",
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
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <AppHeader userName={userName} onLogout={onLogout} />

      <section className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-950">
          <div className="space-y-4 p-4 sm:p-5">
            <button
              type="button"
              onClick={handleCreateNote}
              disabled={isCreating}
              className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              {isCreating ? "Creating..." : "Create note"}
            </button>

            <div className="grid gap-3">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Search
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, content, tags"
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
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
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
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
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  >
                    <option value="desc">Recently updated</option>
                    <option value="asc">Oldest updated</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="max-h-[42vh] overflow-y-auto border-t border-slate-200 dark:border-slate-800 lg:max-h-[calc(100vh-333px)]">
            {isLoading ? (
              <div className="grid gap-3 p-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-3 h-3 w-full" />
                    <Skeleton className="mt-2 h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="p-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-slate-800 dark:text-slate-100">No notes found</p>
                <p className="mt-1">Create a note, clear search, or adjust your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`block w-full px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      selectedNoteId === note.id ? "bg-slate-100 dark:bg-slate-800" : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-1 text-sm font-semibold text-slate-950 dark:text-slate-50">
                        {note.title}
                      </h2>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatUpdatedAt(note.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
                      {note.content}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="min-h-[560px] p-4 sm:p-6">
          {error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {selectedNote ? (
            <div className="flex h-full min-h-[520px] flex-col rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {isSharing
                      ? "Updating..."
                      : selectedNote.isPublic
                        ? "Unshare"
                        : "Share"}
                  </button>
                  <button
                    type="button"
                    onClick={handleArchiveNote}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Archive note
                  </button>
                </div>
              </div>

              <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
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
                        className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
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

              <div className="grid gap-4 border-b border-slate-200 dark:border-slate-800 p-4 sm:grid-cols-[1fr_220px] sm:p-6">
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  placeholder="Note title"
                  className="min-w-0 border-0 bg-transparent text-3xl font-semibold tracking-normal text-slate-950 dark:text-slate-50 outline-none placeholder:text-slate-300"
                />
                <input
                  value={draft.category}
                  onChange={(event) => updateDraft("category", event.target.value)}
                  placeholder="Category"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                />
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
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  />
                </label>
              </div>

              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-4 sm:px-6">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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
                      className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
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
                      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Summary
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                          {selectedNote.aiSummary ?? "No summary generated yet."}
                        </p>
                      </div>

                      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
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
                              className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                            >
                              Apply
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 lg:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action items
                        </p>
                        {selectedNote.actionItems.length > 0 ? (
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {selectedNote.actionItems.map((item) => (
                              <li
                                key={item}
                                className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm leading-5 text-slate-700 dark:text-slate-200"
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
                className="min-h-[360px] flex-1 resize-none rounded-b-lg border-0 bg-white p-4 text-base leading-7 text-slate-800 outline-none placeholder:text-slate-300 dark:bg-slate-900 dark:text-slate-100 sm:p-6"
              />
            </div>
          ) : (
            <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white dark:bg-slate-900 p-6 text-center">
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
    </main>
  );
}
