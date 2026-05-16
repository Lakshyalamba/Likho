"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signup(name, email, password);
      showToast({ title: "Account created", description: "Your dashboard is ready.", type: "success" });
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create account";
      setError(message);
      showToast({ title: "Signup failed", description: message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthFormField
        id="name"
        label="Name"
        value={name}
        placeholder="Lakshya"
        autoComplete="name"
        onChange={setName}
      />
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
        placeholder="At least 8 characters"
        autoComplete="new-password"
        onChange={setPassword}
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
