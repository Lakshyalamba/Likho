import { AuthCard } from "@/components/auth/auth-card";
import { GuestRedirect } from "@/components/auth/guest-redirect";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <GuestRedirect>
      <AuthCard
        title="Create your account"
        description="Start a secure workspace for notes, AI assistance, public sharing, and insights."
        footerText="Already have an account?"
        footerHref="/login"
        footerLinkText="Sign in"
      >
        <SignupForm />
      </AuthCard>
    </GuestRedirect>
  );
}
