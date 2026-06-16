"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProfilePage } from "@/components/profile/profile-page";
import { useAuth } from "@/contexts/auth-context";

export default function ProfileRoute() {
  const router = useRouter();
  const { token, user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <ProtectedRoute>
      {token && user ? (
        <ProfilePage user={user} onLogout={handleLogout} />
      ) : null}
    </ProtectedRoute>
  );
}