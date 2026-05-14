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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Peblo Notes
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          {footerText}{" "}
          <Link href={footerHref} className="font-semibold text-slate-950 hover:text-slate-700 dark:text-white dark:hover:text-slate-200">
            {footerLinkText}
          </Link>
        </p>
      </section>
    </main>
  );
}
