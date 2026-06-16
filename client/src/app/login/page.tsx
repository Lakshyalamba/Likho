import { AuthCard } from "@/components/auth/auth-card";
import { GuestRedirect } from "@/components/auth/guest-redirect";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <GuestRedirect>
      <AuthCard
        title="Welcome back"
        description="Sign in to manage your notes, AI summaries, sharing, and productivity insights."
        footerText="New to Likho?"
        footerHref="/signup"
        footerLinkText="Create an account"
      >
        <LoginForm />
      </AuthCard>
    </GuestRedirect>
  );
}
