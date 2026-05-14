"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProductivityInsights,
  type ProductivityInsights,
  type WeeklyActivityDay
} from "@/lib/insights";

interface ProductivityDashboardProps {
  token: string;
  userName: string;
  onLogout(): void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function ActivityChart({ days }: { days: WeeklyActivityDay[] }) {
  const maxTotal = Math.max(...days.map((day) => day.total), 1);

  return (
    <div className="flex h-56 items-end gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      {days.map((day) => {
        const height = Math.max((day.total / maxTotal) * 100, day.total > 0 ? 10 : 3);

        return (
          <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
            <div className="flex flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-slate-950 transition dark:bg-slate-100"
                style={{ height: `${height}%` }}
                title={`${day.total} activities`}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{day.total}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{formatDate(day.date)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProductivityDashboard({
  token,
  userName,
  onLogout
}: ProductivityDashboardProps) {
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProductivityInsights(token)
      .then((data) => {
        setInsights(data);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load dashboard");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const mostUsedTag = useMemo(() => insights?.mostUsedTags[0], [insights]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50">
        <AppHeader userName={userName} onLogout={onLogout} />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-4 h-8 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !insights) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50">
        <AppHeader userName={userName} onLogout={onLogout} />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error || "Unable to load dashboard"}
          </div>
        </div>
      </main>
    );
  }

  const cards = [
    { label: "Total notes", value: insights.totalNotes },
    { label: "Archived notes", value: insights.archivedNotes },
    { label: "AI usage count", value: insights.aiUsageCount },
    { label: "Most used tag", value: mostUsedTag ? mostUsedTag.tag : "None" }
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50">
      <AppHeader userName={userName} onLogout={onLogout} />

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Productivity dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">
              Your note activity at a glance
            </h1>
          </div>
          <Link
            href="/notes"
            className="rounded-md bg-slate-950 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            Open notes
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">
                {card.value}
              </p>
              {card.label === "Most used tag" && mostUsedTag ? (
                <p className="mt-2 text-sm text-slate-500">{mostUsedTag.count} notes</p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Weekly activity</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Created and updated notes grouped by day.</p>
            </div>
            <ActivityChart days={insights.weeklyActivitySummary} />
          </section>

          <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Most used tags</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Top tags across your notes.</p>
              </div>
            </div>

            {insights.mostUsedTags.length > 0 ? (
              <div className="space-y-3">
                {insights.mostUsedTags.slice(0, 6).map((tag) => (
                  <div key={tag.tag} className="flex items-center justify-between gap-4">
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                      {tag.tag}
                    </span>
                    <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">{tag.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">No tags yet.</p>
            )}
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Recently edited notes</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Latest notes ordered by update time.</p>
            </div>
            <Link href="/notes" className="text-sm font-semibold text-slate-950 hover:text-slate-600 dark:text-slate-50 dark:hover:text-slate-300">
              View all
            </Link>
          </div>

          {insights.recentlyEditedNotes.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {insights.recentlyEditedNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-950 dark:text-slate-50">{note.title}</h3>
                      {note.archived ? (
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                          Archived
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{note.category}</p>
                    {note.tags.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {note.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm text-slate-500">
                    {formatUpdatedAt(note.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">No notes yet</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Create your first note to populate this dashboard.</p>
              <Link
                href="/notes"
                className="mt-4 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
              >
                Create note
              </Link>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
