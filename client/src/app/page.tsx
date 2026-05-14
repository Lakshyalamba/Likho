import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 sm:px-6">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <nav className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Peblo Notes
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Signup
            </Link>
          </div>
        </nav>

        <div className="pt-8 sm:pt-14">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Peblo Full Stack Developer Challenge
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 dark:text-slate-50 sm:text-5xl">
            AI-ready notes with secure authentication.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Sign up or log in to access the protected dashboard powered by the
            Express, MongoDB, JWT, and Gemini-ready backend.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-md bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-slate-300 bg-white dark:bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:bg-slate-800"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Client</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Next.js App Router, TypeScript, and Tailwind CSS.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Server</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Express, Mongoose, JWT auth middleware, and health check endpoint.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">API Base URL</h2>
          <code className="mt-3 block rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800">
            {API_BASE_URL}
          </code>
        </div>
      </section>
    </main>
  );
}
