"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/contexts/theme-context";

interface AppShellProps {
  userName: string;
  onLogout(): void;
  children: React.ReactNode;
  onNewNote?: () => void;
  isCreatingNote?: boolean;
}

const navItems = [
  { href: "/notes", label: "Notes" }
];

export function AppShell({
  userName,
  onLogout,
  children,
  onNewNote,
  isCreatingNote = false
}: AppShellProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const quickAction = onNewNote ? (
    <button
      type="button"
      onClick={onNewNote}
      disabled={isCreatingNote}
      className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
    >
      {isCreatingNote ? "Creating..." : "New note"}
    </button>
  ) : (
    <Link
      href="/notes"
      className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
    >
      New note
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200/80 bg-white/85 py-5 backdrop-blur-xl transition-all duration-200 dark:border-slate-800 dark:bg-slate-950/85 lg:flex ${
          isSidebarOpen ? "w-64 px-4" : "w-16 px-2"
        }`}
      >
        <div>
          <div className={`flex items-center gap-2 ${isSidebarOpen ? "justify-between" : "justify-center"}`}>
            <Link
              href="/notes"
              className={`min-w-0 ${isSidebarOpen ? "block" : "flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950"}`}
              title="Peblo AI Notes"
            >
              {isSidebarOpen ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Peblo
                  </p>
                  <h1 className="mt-1 truncate text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
                    AI Notes
                  </h1>
                </>
              ) : (
                "P"
              )}
            </Link>
            {isSidebarOpen ? (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                ‹
              </button>
            ) : null}
          </div>

          {!isSidebarOpen ? (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="mt-4 flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              ›
            </button>
          ) : null}

          <div className="mt-6">
            {isSidebarOpen ? (
              quickAction
            ) : onNewNote ? (
              <button
                type="button"
                onClick={onNewNote}
                disabled={isCreatingNote}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-950 text-lg font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                aria-label="New note"
                title="New note"
              >
                +
              </button>
            ) : (
              <Link
                href="/notes"
                className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-950 text-lg font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                aria-label="New note"
                title="New note"
              >
                +
              </Link>
            )}
          </div>

          <nav className="mt-6 grid gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex h-10 items-center rounded-lg text-sm font-medium transition-colors ${
                    isSidebarOpen ? "px-3" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isSidebarOpen ? item.label : item.label.charAt(0)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          className={`mt-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 ${
            isSidebarOpen ? "" : "flex items-center justify-center"
          }`}
          title={userName}
        >
          {isSidebarOpen ? (
            <>
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{userName}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Signed in</p>
            </>
          ) : (
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </aside>

      <div
        className={`fixed right-0 top-0 z-20 hidden h-14 items-center justify-end gap-2 border-b border-slate-200/80 bg-white/85 px-6 backdrop-blur-xl transition-all duration-200 dark:border-slate-800 dark:bg-slate-950/85 lg:flex ${
          isSidebarOpen ? "left-64" : "left-16"
        }`}
      >
        <Link
          href="/dashboard"
          className={`flex h-9 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
            pathname === "/dashboard"
              ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Logout
        </button>
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/notes" className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">Peblo AI Notes</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userName}</p>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="mt-3 grid grid-cols-2 gap-2">
          {[...navItems, { href: "/dashboard", label: "Dashboard" }].map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-9 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className={`transition-[padding] duration-200 lg:pt-14 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-16"}`}>
        {children}
      </main>
    </div>
  );
}
