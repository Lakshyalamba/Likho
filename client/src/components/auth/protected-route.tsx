"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="grid w-full max-w-sm gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
