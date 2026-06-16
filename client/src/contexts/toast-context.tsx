"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, type = "info" }: ToastInput) => {
      const id = crypto.randomUUID();
      const toast = {
        id,
        title,
        description,
        type
      };

      setToasts((currentToasts) => [toast, ...currentToasts].slice(0, 4));
      window.setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed left-1/2 top-6 z-50 grid w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 gap-3 sm:top-8">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismissToast(toast.id)}
            className={`rounded-lg border bg-white p-4 text-left shadow-lg transition dark:bg-slate-900 ${
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
          </button>
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
