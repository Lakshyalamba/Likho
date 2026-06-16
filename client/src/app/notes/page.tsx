"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { NotesWorkspace } from "@/components/notes/notes-workspace";
import { useAuth } from "@/contexts/auth-context";

export default function NotesPage() {
  const router = useRouter();
  const { token, user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <ProtectedRoute>
      {token && user ? (
        <NotesWorkspace token={token} userName={user.name} userEmail={user.email} onLogout={handleLogout} />
      ) : null}
    </ProtectedRoute>
  );
}
