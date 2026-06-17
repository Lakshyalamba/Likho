"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/theme-context";

const testimonials = [
  {
    quote: "Likho completely changed how I organize my daily standup notes. The AI summaries save me at least 30 minutes every morning.",
    name: "Priya Sharma",
    role: "Product Manager at TechCorp",
    initials: "PS"
  },
  {
    quote: "I switched from Notion because of the sharing — being able to publish a clean read-only link in one click is exactly what my team needed.",
    name: "Rahul Mehta",
    role: "Freelance Designer",
    initials: "RM"
  },
  {
    quote: "The autosave is seamless and the tag-based organization actually makes sense. No more hunting through folders for that one note.",
    name: "Ananya Gupta",
    role: "Graduate Researcher",
    initials: "AG"
  }
];

const faqs = [
  {
    q: "Is Likho free to use?",
    a: "Yes, Likho is completely free during the beta period. Create an account and start writing — no credit card required."
  },
  {
    q: "Can I access my notes offline?",
    a: "Not yet. Likho requires an internet connection to sync your notes. Offline support is on the roadmap."
  },
  {
    q: "How does the AI summary work?",
    a: "Likho uses Google Gemini to analyze your note content and generate a concise summary, action items, and a suggested title. If Gemini is unavailable, it falls back to a local mock."
  },
  {
    q: "Are my notes private?",
    a: "Yes. Notes are private by default and scoped to your account. Only you can see them unless you choose to publish a shareable read-only link."
  },
  {
    q: "Can I collaborate in real time?",
    a: "Currently Likho supports share-link based collaboration. Realtime multi-user editing is planned for a future release."
  }
];

const featureCards = [
  {
    title: "Write without friction",
    description: "Autosave keeps notes current while tags, categories, archive, and search keep the workspace organized.",
    accent: "bg-emerald-500"
  },
  {
    title: "Turn notes into next steps",
    description: "Generate summaries, action items, and cleaner titles from the context already in your note.",
    accent: "bg-sky-500"
  },
  {
    title: "Share the final version",
    description: "Publish a read-only link for any note, then unshare it instantly when access should end.",
    accent: "bg-amber-500"
  }
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8f4] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <nav className="fixed inset-x-0 top-0 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-[70rem] items-center justify-between rounded-2xl border border-white/20 bg-white/40 px-5 py-3 shadow-lg shadow-black/5 backdrop-blur-2xl transition-all duration-200 dark:border-white/10 dark:bg-slate-950/40 sm:mt-4 sm:px-5 sm:py-3" style={{ left: '1rem', right: '1rem' }}>
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition group-hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
            L
          </span>
          <span className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Likho
          </span>
        </Link>
        <div className="hidden items-center gap-6 sm:flex">
          <Link href="#features" className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
            Features
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
            Testimonials
          </Link>
          <Link href="#faq" className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
            FAQ
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white/75 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:hover:bg-slate-900"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Get started
          </Link>
        </div>
      </nav>
      <section className="relative min-h-[90vh] px-4 pt-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 landing-paper-grid opacity-70 dark:opacity-25" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-800/20" />
        <div className="absolute -right-32 top-40 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-800/20" />
        <div className="absolute bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-200/15 blur-3xl dark:bg-amber-800/15" />

        <div className="relative z-10 mx-auto flex min-h-[84vh] max-w-6xl flex-col">
          <div className="flex flex-1 flex-col items-center justify-center py-16 lg:flex-row lg:gap-16">
            <div className="max-w-2xl landing-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Notes that keep moving
              </span>
              <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                Capture ideas,{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-sky-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-sky-400">
                  summarize
                </span>{" "}
                decisions, and share polished notes.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Likho gives you a focused writing space with autosave, smart organization,
                AI-powered clarity, public sharing, and activity insights in one secure workspace.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Create your workspace
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/75 px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  Sign in
                </Link>
              </div>
            </div>
            <div className="mt-12 hidden w-full max-w-md lg:mt-0 lg:block landing-fade-up landing-fade-delay">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-medium text-slate-400">likho.app - Untitled note</span>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-1/3 rounded-md bg-slate-200 dark:bg-slate-800" />
                    <div className="flex gap-2">
                      <span className="h-6 w-16 rounded-md bg-slate-100 dark:bg-slate-800" />
                      <span className="h-6 w-16 rounded-md bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </div>
                  <div className="h-10 w-3/4 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-4/6 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">work</span>
                    <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">ideas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 border-y border-slate-200 bg-white px-4 py-14 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              className="animate-scale-in rounded-[8px] border border-slate-200 bg-[#fbfcf8] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <span className={`block h-1.5 w-12 rounded-sm ${feature.accent}`} />
              <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f6f8f4] px-4 py-16 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="animate-slide-up">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              Built for daily review
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
              From rough notes to clear follow-through.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-300">
              Review recent edits, spot your most-used tags, and keep active work separate from archived
              references without leaving the notes flow.
            </p>
          </div>
          <div className="animate-float-delayed rounded-[8px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[8px] bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
                <p className="text-xs font-medium uppercase opacity-70">Total notes</p>
                <p className="mt-3 text-3xl font-semibold">128</p>
              </div>
              <div className="rounded-[8px] bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">
                <p className="text-xs font-medium uppercase opacity-70">AI runs</p>
                <p className="mt-3 text-3xl font-semibold">42</p>
              </div>
              <div className="rounded-[8px] bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-100">
                <p className="text-xs font-medium uppercase opacity-70">Shared</p>
                <p className="mt-3 text-3xl font-semibold">16</p>
              </div>
            </div>
            <div className="mt-5 rounded-[8px] border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Recently edited</p>
                <span className="text-sm text-slate-500 dark:text-slate-400">Live workspace</span>
              </div>
              <div className="mt-4 space-y-3">
                {["Sprint planning", "Customer interview notes", "Launch checklist"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-3 dark:bg-slate-950">
                    <span className="text-sm font-medium">{item}</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="border-y border-slate-200 bg-white px-4 py-16 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="animate-scale-in text-center text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Testimonials
          </p>
          <h2 className="animate-slide-up mt-3 text-center text-3xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
            Loved by note-takers
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <article
                key={t.name}
                className="animate-scale-in flex flex-col rounded-2xl border border-slate-200 bg-[#fbfcf8] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <svg className="h-6 w-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
                <p className="mt-4 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#f6f8f4] px-4 py-16 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="animate-scale-in text-center text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
            FAQ
          </p>
          <h2 className="animate-slide-up mt-3 text-center text-3xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
            Questions? Answers.
          </h2>
          <div className="mt-12 grid gap-4">
            {faqs.map((faq, i) => (
              <details
                key={faq.q}
                className="animate-slide-up group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 open:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-950 dark:text-white">
                  {faq.q}
                  <svg className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-12 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="group flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                L
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Likho
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="#features" className="text-xs font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                Features
              </Link>
              <Link href="#testimonials" className="text-xs font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                Testimonials
              </Link>
              <Link href="#faq" className="text-xs font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                FAQ
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-center dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              &copy; {new Date().getFullYear()} Likho. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
