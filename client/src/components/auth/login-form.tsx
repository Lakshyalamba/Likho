"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

const DEMO_EMAIL = "demo@likho.local";
const DEMO_PASSWORD = "demo1234";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      showToast({ title: "Signed in", description: "Welcome back to your workspace.", type: "success" });
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      setError(message);
      showToast({ title: "Sign in failed", description: message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleUseDemoCredentials() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError("");
    showToast({
      title: "Demo credentials filled",
      description: "Click Sign in to open the demo workspace.",
      type: "success"
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthFormField
        id="email"
        label="Email"
        type="email"
        value={email}
        placeholder="you@example.com"
        autoComplete="email"
        onChange={setEmail}
      />
      <AuthFormField
        id="password"
        label="Password"
        type="password"
        value={password}
        placeholder="Enter your password"
        autoComplete="current-password"
        onChange={setPassword}
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleUseDemoCredentials}
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center rounded-xl border border-white/30 bg-white/70 px-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-all hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
      >
        Use demo credentials
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:from-white dark:to-slate-200 dark:text-slate-950 dark:shadow-white/10"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
