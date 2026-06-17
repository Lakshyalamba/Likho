import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
  children: ReactNode;
}

export function AuthCard({
  title,
  description,
  footerText,
  footerHref,
  footerLinkText,
  children
}: AuthCardProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-10 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/30 sm:px-6">
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-700/20" />
      <div className="absolute -right-32 top-40 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-700/20" />
      <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-amber-200/15 blur-3xl dark:bg-amber-700/15" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[length:44px_44px] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

      <Link href="/" className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm shadow-black/[0.03] backdrop-blur-2xl transition hover:border-white/50 hover:bg-white/70 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-white/20 dark:hover:bg-slate-900/70 dark:hover:text-white sm:left-8 sm:top-8">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to home
      </Link>

      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 text-lg font-bold text-white shadow-lg shadow-slate-900/20 dark:from-white dark:to-slate-200 dark:text-slate-950">
            L
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/60 p-6 shadow-xl shadow-black/[0.04] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60 sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {footerText}{" "}
          <Link href={footerHref} className="font-semibold text-slate-950 hover:text-slate-700 dark:text-white dark:hover:text-slate-200">
            {footerLinkText}
          </Link>
        </p>
      </section>
    </main>
  );
}
