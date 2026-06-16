"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSharedNote, type PublicNote } from "@/lib/notes";

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function SharedNoteReader({ shareId }: { shareId: string }) {
  const [note, setNote] = useState<PublicNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSharedNote(shareId)
      .then((sharedNote) => {
        setNote(sharedNote);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Shared note not found");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [shareId]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f5f2] px-4 dark:bg-slate-950">
        <div className="grid w-full max-w-2xl gap-4 rounded-2xl border border-slate-200 bg-white/95 p-6 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </main>
    );
  }

  if (error || !note) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f5f2] px-4 py-10 dark:bg-slate-950">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Likho
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">
            This note is not available
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            It may have been made private or the link is incorrect.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            Go home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f5f2] px-4 py-8 dark:bg-slate-950 sm:px-6 lg:py-12">
      <article className="mx-auto max-w-[760px] rounded-2xl border border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-900">
        <header className="border-b border-slate-200 px-5 py-8 dark:border-slate-800 sm:px-10 sm:py-10">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Shared via Likho
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-slate-50 sm:text-4xl">
            {note.title}
          </h1>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span>{note.category}</span>
            <span>Updated {formatUpdatedAt(note.updatedAt)}</span>
          </div>
          {note.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="px-5 py-8 sm:px-10 sm:py-10">
          <div className="whitespace-pre-wrap text-base leading-8 text-slate-800 dark:text-slate-100">
            {note.content || "This shared note is empty."}
          </div>

          {note.aiSummary || note.actionItems.length > 0 || note.suggestedTitle ? (
            <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                AI note intelligence
              </h2>

              {note.aiSummary ? (
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Summary
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {note.aiSummary}
                  </p>
                </div>
              ) : null}

              {note.actionItems.length > 0 ? (
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Action items
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {note.actionItems.map((item) => (
                      <li
                        key={item}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </article>
    </main>
  );
}
