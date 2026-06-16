"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/app/app-shell";
import { useAuth, type AuthUser } from "@/contexts/auth-context";

interface Props {
  user: AuthUser;
  onLogout(): void;
}

export function ProfilePage({ user, onLogout }: Props) {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        name,
        username: username.trim() || null,
        bio: bio.trim() || null
      });
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveUsername() {
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({ username: null });
      setUsername("");
      setMessage({ type: "success", text: "Username removed" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <AppShell userName={user.name} userEmail={user.email} onLogout={onLogout}>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-white/25 bg-white/50 p-6 shadow-sm shadow-black/[0.02] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 sm:p-8">
          <div className="flex items-center gap-5">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-950 to-slate-700 text-xl font-bold text-white shadow-lg dark:from-white dark:to-slate-200 dark:text-slate-950">
              {initial}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">{user.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              {user.username ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">@{user.username}</p>
              ) : null}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/25 bg-white/50 p-6 shadow-sm shadow-black/[0.02] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Edit profile</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your display name, username, and bio.</p>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="mt-2 h-11 w-full rounded-xl border border-white/40 bg-white/70 px-3 text-sm text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-200/50 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-800/60 dark:focus:ring-slate-700/30"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Username</span>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="h-11 w-full rounded-xl border border-white/40 bg-white/70 pl-7 pr-10 text-sm text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-200/50 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-800/60 dark:focus:ring-slate-700/30"
                />
                {user.username ? (
                  <button
                    type="button"
                    onClick={handleRemoveUsername}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Letters, numbers, underscores, and hyphens only.</p>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Tell us a bit about yourself..."
                className="mt-2 h-24 w-full resize-none rounded-xl border border-white/40 bg-white/70 px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-200/50 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-800/60 dark:focus:ring-slate-700/30"
              />
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{bio.length}/500</p>
            </label>
          </div>

          {message ? (
            <div
              className={`mt-5 rounded-xl px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border border-emerald-200/50 bg-emerald-50/80 text-emerald-700 backdrop-blur dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border border-red-200/50 bg-red-50/80 text-red-700 backdrop-blur dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:from-white dark:to-slate-200 dark:text-slate-950"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 bg-white/60 px-5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="rounded-2xl border border-white/25 bg-white/50 p-6 shadow-sm shadow-black/[0.02] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Account</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your email address is read-only and used for login.</p>
          <div className="mt-4 rounded-xl border border-white/20 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-slate-800/30">
            <p className="text-sm font-medium text-slate-950 dark:text-slate-50">{user.email}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}