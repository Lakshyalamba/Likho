"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastInput {
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextValue {
  showToast(toast: ToastInput): void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    ({ title, description, type = "info" }: ToastInput) => {
      const id = crypto.randomUUID();
      const toast = { id, title, description, type };

      setToasts((currentToasts) => [toast, ...currentToasts].slice(0, 4));
      const timeoutId = window.setTimeout(() => dismissToast(id), 3500);
      timeoutsRef.current.set(id, timeoutId);
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed left-1/2 top-6 z-50 grid w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 gap-3 sm:top-8"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`relative rounded-lg border bg-white p-4 pr-10 shadow-lg dark:bg-slate-900 ${
              toast.type === "success"
                ? "border-emerald-200 dark:border-emerald-800"
                : toast.type === "error"
                  ? "border-red-200 dark:border-red-800"
                  : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
              {toast.title}
            </p>
            {toast.description ? (
              <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                {toast.description}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Dismiss"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
