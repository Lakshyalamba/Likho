"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProductivityDashboard } from "@/components/dashboard/productivity-dashboard";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <ProtectedRoute>
      {token && user ? (
        <ProductivityDashboard token={token} userName={user.name} userEmail={user.email} onLogout={handleLogout} />
      ) : null}
    </ProtectedRoute>
  );
}
