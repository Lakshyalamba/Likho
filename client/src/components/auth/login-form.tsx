"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

const DEMO_EMAIL = "demo@peblo.local";
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
        className="flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
      >
        Use demo credentials
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
