"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProductivityInsights,
  type ProductivityInsights,
  type WeeklyActivityDay
} from "@/lib/insights";

interface Props {
  token: string;
  userName: string;
  userEmail?: string;
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

function greeting(name: string) {
  return `Welcome, ${name.split(" ")[0]}`;
}

function todayStr() {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date());
}

function computeStreak(days: WeeklyActivityDay[]): { streak: number; activeDays: number } {
  const active = days.filter((d) => d.total > 0).length;
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].total > 0) streak++;
    else break;
  }
  return { streak, activeDays: active };
}

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: ReactNode }) {
  return (
    <div className="group rounded-2xl border border-white/25 bg-white/50 p-5 shadow-sm shadow-black/[0.02] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/40 hover:shadow-md dark:border-white/10 dark:bg-slate-900/50 dark:hover:border-white/20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
        {value}
      </p>
      {sub ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sub}</p> : null}
    </div>
  );
}

function ActivityChart({ days }: { days: WeeklyActivityDay[] }) {
  const maxVal = Math.max(...days.map((d) => d.total), 1);

  return (
    <div className="flex h-56 items-end gap-2 rounded-xl border border-white/25 bg-white/40 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/40 sm:gap-3">
      {days.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">No activity yet</p>
        </div>
      ) : (
        days.map((day) => {
          const totalH = Math.max((day.total / maxVal) * 100, day.total > 0 ? 10 : 3);

          return (
            <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5">
              <div className="flex flex-1 flex-col-reverse items-center gap-0.5" style={{ height: `${totalH}%` }}>
                {day.created > 0 ? (
                  <div className="w-full rounded-t-sm bg-emerald-500 transition-all hover:opacity-80 dark:bg-emerald-400" style={{ height: `${(day.created / day.total) * 100}%`, minHeight: day.created > 0 ? 4 : 0 }} title={`${day.created} created`} aria-label={`${day.created} notes created on ${formatDate(day.date)}`} />
                ) : null}
                {day.updated > 0 ? (
                  <div className="w-full rounded-t-sm bg-slate-500 transition-all hover:opacity-80 dark:bg-slate-400" style={{ height: `${(day.updated / day.total) * 100}%`, minHeight: day.updated > 0 ? 4 : 0 }} title={`${day.updated} updated`} aria-label={`${day.updated} notes updated on ${formatDate(day.date)}`} />
                ) : null}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{day.total}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">{formatDate(day.date)}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function DonutChart({ active, archived }: { active: number; archived: number }) {
  const total = active + archived;
  const pct = total > 0 ? (active / total) * 100 : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex items-center gap-5">
      <svg width="90" height="90" className="-rotate-90 shrink-0" aria-label={`Note distribution: ${active} active, ${archived} archived`}>
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgb(226 232 240)" strokeWidth="8" className="dark:stroke-slate-800" />
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgb(15 23 42)" strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="dark:stroke-slate-100" />
      </svg>
      <div>
        <p className="text-2xl font-bold text-slate-950 dark:text-slate-50">{total}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-950 dark:bg-slate-100 mr-1" /> {active} active
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 mr-1" /> {archived} archived
        </p>
      </div>
    </div>
  );
}

export function ProductivityDashboard({ token, userName, userEmail, onLogout }: Props) {
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getProductivityInsights(token)
      .then((data) => {
        if (!cancelled) {
          setInsights(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [token]);

  const mostUsedTag = useMemo(() => insights?.mostUsedTags[0], [insights]);

  const categories = useMemo(() => {
    if (!insights) return [];
    const map = new Map<string, number>();
    insights.recentlyEditedNotes.forEach((n) => {
      const cat = n.category || "Uncategorized";
      map.set(cat, (map.get(cat) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [insights]);

  const streak = useMemo(() => insights ? computeStreak(insights.weeklyActivitySummary) : { streak: 0, activeDays: 0 }, [insights]);
  const activeNotes = useMemo(() => (insights?.totalNotes ?? 0) - (insights?.archivedNotes ?? 0), [insights]);

  const maxTagCount = useMemo(() => Math.max(...(insights?.mostUsedTags.map((t) => t.count) ?? [1]), 1), [insights]);

  const loadingSkeleton = (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/25 bg-white/50 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-8 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );

  const emptyState = (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/40 p-12 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/40">
        <svg className="h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">No notes yet</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Create your first note to populate this dashboard.</p>
        <Link
          href="/notes"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-xl dark:from-white dark:to-slate-200 dark:text-slate-950"
        >
          Create note
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );

  if (isLoading) {
    return <AppShell userName={userName} userEmail={userEmail} onLogout={onLogout}>{loadingSkeleton}</AppShell>;
  }

  if (error || !insights) {
    return (
      <AppShell userName={userName} userEmail={userEmail} onLogout={onLogout}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div role="alert" className="rounded-2xl border border-red-200/50 bg-red-50/80 p-6 text-sm text-red-700 backdrop-blur-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error || "Unable to load dashboard"}
          </div>
        </div>
      </AppShell>
    );
  }

  if (insights.totalNotes === 0) {
    return <AppShell userName={userName} userEmail={userEmail} onLogout={onLogout}>{emptyState}</AppShell>;
  }

  return (
    <AppShell userName={userName} userEmail={userEmail} onLogout={onLogout}>
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{todayStr()}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">{greeting(userName)}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {activeNotes} active notes &middot; {streak.activeDays} active days this week
              {streak.streak > 1 ? <span> &middot; {streak.streak}-day streak</span> : null}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              All notes
            </Link>
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-xl dark:from-white dark:to-slate-200 dark:text-slate-950"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New note
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total notes" value={insights.totalNotes} icon={
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          } sub={`${activeNotes} active, ${insights.archivedNotes} archived`} />
          <StatCard label="This week" value={insights.weeklyActivitySummary.reduce((s, d) => s + d.total, 0)} icon={
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
          } sub={`${streak.activeDays} active days`} />
          <StatCard label="AI runs" value={insights.aiUsageCount} icon={
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
          } sub={insights.aiUsageCount > 0 ? "summaries & action items" : "generate your first summary"} />
          <StatCard label="Top tag" value={mostUsedTag ? mostUsedTag.tag : "\u2014"} icon={
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
          } sub={mostUsedTag ? `${mostUsedTag.count} notes tagged` : undefined} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl border border-white/25 bg-white/50 p-5 shadow-sm shadow-black/[0.02] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Weekly activity</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Created vs updated notes per day</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 dark:bg-emerald-400" /> Created</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-500 dark:bg-slate-400" /> Updated</span>
              </div>
            </div>
            <ActivityChart days={insights.weeklyActivitySummary} />
          </section>

          <section className="rounded-2xl border border-white/25 bg-white/50 p-5 shadow-sm shadow-black/[0.02] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Note distribution</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active vs archived breakdown</p>
            </div>
            <DonutChart active={activeNotes} archived={insights.archivedNotes} />

            {streak.streak > 1 ? (
              <div className="mt-5 rounded-xl border border-amber-200/50 bg-amber-50/50 p-3 dark:border-amber-800/30 dark:bg-amber-950/20">
                <p className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
                  <svg className="h-4 w-4 text-amber-600 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>
                  {streak.streak}-day writing streak</p>
                <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">Keep it going! Write something today.</p>
              </div>
            ) : null}
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-2xl border border-white/25 bg-white/50 p-5 shadow-sm shadow-black/[0.02] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Most used tags</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Top tags by note count</p>
            </div>
            {insights.mostUsedTags.length > 0 ? (
              <div className="space-y-3">
                {insights.mostUsedTags.slice(0, 6).map((tag) => (
                  <div key={tag.tag} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{tag.tag}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-slate-950 dark:bg-slate-100" style={{ width: `${(tag.count / maxTagCount) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-5 text-right">{tag.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">No tags yet. Add tags to your notes to see them here.</p>
            )}
          </section>

          <section className="rounded-2xl border border-white/25 bg-white/50 p-5 shadow-sm shadow-black/[0.02] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Categories</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">From your recently edited notes</p>
            </div>
            {categories.length > 0 ? (
              <div className="grid gap-2.5">
                {categories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-white/50 dark:hover:bg-slate-800/50">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{cat.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">No categories yet.</p>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-white/25 bg-white/50 p-5 shadow-sm shadow-black/[0.02] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 sm:p-6">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Recently edited notes</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Latest notes ordered by update time.</p>
            </div>
            <Link href="/notes" className="text-sm font-semibold text-slate-950 hover:text-slate-600 dark:text-slate-50 dark:hover:text-slate-300">
              View all &rarr;
            </Link>
          </div>

          {insights.recentlyEditedNotes.length > 0 ? (
            <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {insights.recentlyEditedNotes.map((note) => (
                <div key={note.id} className="flex flex-col gap-3 py-4 transition hover:bg-white/30 dark:hover:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between sm:px-3 -mx-3 rounded-lg">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-slate-950 dark:text-slate-50">{note.title}</h3>
                      {note.archived ? (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          Archived
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {note.category ? <span className="text-xs text-slate-400 dark:text-slate-500">{note.category}</span> : null}
                      {note.tags.length > 0 ? (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">&middot;</span>
                          {note.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tag}</span>
                          ))}
                          {note.tags.length > 4 ? <span className="text-xs text-slate-400 dark:text-slate-500">+{note.tags.length - 4} more</span> : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                  <p className="shrink-0 text-sm text-slate-400 dark:text-slate-500">{formatUpdatedAt(note.updatedAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/40 p-8 text-center backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/40">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">No recently edited notes</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create or edit a note and it will appear here.</p>
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}