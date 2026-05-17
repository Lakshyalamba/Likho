import Link from "next/link";

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
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8f4] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <section className="relative min-h-[88vh] px-4 py-6 sm:px-6 lg:px-8">
        <div className="absolute inset-0 landing-paper-grid opacity-70 dark:opacity-25" />
        <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/20" />
        <div className="absolute bottom-16 right-10 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-900/20" />

        <div className="relative z-10 mx-auto flex min-h-[82vh] max-w-6xl flex-col">
          <nav className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition group-hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                P
              </span>
              <span className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                Peblo AI Notes
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Get started
              </Link>
            </div>
          </nav>

          <div className="flex flex-1 items-center py-20">
            <div className="max-w-4xl landing-fade-up">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Notes that keep moving
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                Capture ideas, summarize decisions, and share polished notes.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                Peblo AI Notes gives you a focused writing space with autosave, smart organization,
                AI-generated clarity, public sharing, and activity insights in one secure workspace.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="rounded-md bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Create your workspace
                </Link>
                <Link
                  href="/login"
                  className="rounded-md border border-slate-300 bg-white/75 px-6 py-3 text-center text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-slate-200 bg-white px-4 py-14 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              className="rounded-[8px] border border-slate-200 bg-[#fbfcf8] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
              style={{ animationDelay: `${index * 110}ms` }}
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
          <div>
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
          <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
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
    </main>
  );
}
