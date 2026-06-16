"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/contexts/theme-context";

interface AppShellProps {
  userName: string;
  userEmail?: string;
  onLogout(): void;
  children: React.ReactNode;
  onNewNote?: () => void;
  isCreatingNote?: boolean;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )},
  { href: "/notes", label: "Notes", icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )}
];

export function AppShell({
  userName,
  userEmail,
  onLogout,
  children,
  onNewNote,
  isCreatingNote = false
}: AppShellProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const quickAction = onNewNote ? (
    <button
      type="button"
      onClick={onNewNote}
      disabled={isCreatingNote}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:from-white dark:to-slate-200 dark:text-slate-950"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {isCreatingNote ? "Creating..." : "New note"}
    </button>
  ) : (
    <Link
      href="/notes"
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:shadow-xl dark:from-white dark:to-slate-200 dark:text-slate-950"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      New note
    </Link>
  );

  const userInitial = userName.charAt(0).toUpperCase();
  const displayEmail = userEmail ?? (userName.includes("@") ? userName : `${userName.toLowerCase().replace(/\s+/g, ".")}@likho.app`);

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/20 bg-white/40 py-5 backdrop-blur-2xl transition-all duration-200 dark:border-white/10 dark:bg-slate-950/40 lg:flex ${
          isSidebarOpen ? "w-64 px-4" : "w-[72px] px-3"
        }`}
      >
        <div className="flex flex-col gap-1">
          <div className={`flex items-center ${isSidebarOpen ? "justify-between" : "justify-center"}`}>
            <Link
              href="/notes"
              className={`shrink-0 ${isSidebarOpen ? "" : "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-slate-950 to-slate-700 text-sm font-bold text-white shadow-md dark:from-white dark:to-slate-200 dark:text-slate-950"}`}
              title="Likho"
            >
              {isSidebarOpen ? (
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-950 to-slate-700 text-sm font-bold text-white shadow-md dark:from-white dark:to-slate-200 dark:text-slate-950">
                    L
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Likho</p>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Notes</p>
                  </div>
                </div>
              ) : null}
            </Link>
            {isSidebarOpen ? (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/60 text-sm text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white"
                aria-label="Collapse sidebar"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            ) : null}
          </div>

          {!isSidebarOpen ? (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="mt-4 flex h-9 w-full items-center justify-center rounded-xl border border-white/20 bg-white/60 text-sm text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white"
              aria-label="Open sidebar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : null}

          <div className={`mt-5 ${!isSidebarOpen ? "mt-4" : ""}`}>
            {isSidebarOpen ? quickAction : (
              <Link
                href="/notes"
                className="flex h-10 w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 text-white shadow-lg shadow-slate-900/15 dark:from-white dark:to-slate-200 dark:text-slate-950"
                aria-label="New note"
                title="New note"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </Link>
            )}
          </div>

          <nav className={`grid gap-1 ${isSidebarOpen ? "mt-6" : "mt-5"}`}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex h-10 items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    isSidebarOpen ? "px-3" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-white/70 text-slate-950 shadow-sm backdrop-blur dark:bg-slate-800/60 dark:text-white"
                      : "text-slate-500 hover:bg-white/50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-white"
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {isSidebarOpen ? item.label : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex w-full items-center gap-3 rounded-xl border border-white/20 bg-white/50 p-3 text-left shadow-sm backdrop-blur transition hover:bg-white/70 dark:border-white/10 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 ${
              !isSidebarOpen ? "justify-center p-2" : ""
            }`}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-slate-950 to-slate-700 text-xs font-bold text-white dark:from-white dark:to-slate-200 dark:text-slate-950">
              {userInitial}
            </span>
            {isSidebarOpen ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{userName}</p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">Free plan</p>
              </div>
            ) : null}
            {isSidebarOpen ? (
              <svg className={`h-4 w-4 shrink-0 text-slate-400 transition ${showProfileMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            ) : null}
          </button>

          {showProfileMenu && isSidebarOpen ? (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-white/20 bg-white/80 p-2 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80">
              <div className="border-b border-slate-200/60 px-3 py-2 dark:border-slate-800/60">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{userName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{displayEmail}</p>
              </div>
              <div className="mt-1 grid gap-0.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50/70 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <div
        className={`fixed right-0 top-0 z-20 hidden h-14 items-center justify-end gap-3 border-b border-white/20 bg-white/40 px-6 shadow-sm shadow-black/[0.02] backdrop-blur-2xl transition-all duration-200 dark:border-white/10 dark:bg-slate-950/40 lg:flex ${
          isSidebarOpen ? "left-64" : "left-[72px]"
        }`}
      >
        <Link
          href="/dashboard"
          className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
            pathname === "/dashboard"
              ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
              : "border border-white/20 bg-white/50 text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:border-white/10 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Dashboard
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-white/20 bg-white/50 px-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:bg-white/80 hover:text-slate-950 dark:border-white/10 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
        >
          {theme === "dark" ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-white/20 bg-white/50 px-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:bg-white/80 hover:text-slate-950 dark:border-white/10 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M3 9h12" />
          </svg>
          Sign out
        </button>

        <div className="ml-2 h-6 w-px bg-slate-200/60 dark:bg-slate-700/60" />

        <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-slate-950 to-slate-700 text-[11px] font-bold text-white dark:from-white dark:to-slate-200 dark:text-slate-950">
          {userInitial}
        </span>
      </div>

      <header className="sticky top-0 z-20 border-b border-white/20 bg-white/60 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-slate-950 to-slate-700 text-xs font-bold text-white dark:from-white dark:to-slate-200 dark:text-slate-950">
              L
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Likho</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/60 text-slate-600 backdrop-blur hover:bg-white/80 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-400"
            >
              {theme === "dark" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/60 text-slate-600 backdrop-blur hover:bg-white/80 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M3 9h12" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="mt-3 grid grid-cols-2 gap-2">
          {[...navItems].map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-white/70 text-slate-950 shadow-sm backdrop-blur dark:bg-slate-800/60 dark:text-white"
                    : "bg-white/40 text-slate-600 backdrop-blur hover:bg-white/70 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-slate-800/60"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className={`transition-[padding] duration-200 lg:pt-14 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-[72px]"}`}>
        {children}
      </main>
    </div>
  );
}