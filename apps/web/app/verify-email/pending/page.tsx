import { Mail } from "lucide-react";
import { ResendVerificationButton } from "./resend-button";
import { getCurrentUserProfile } from "../../src/actions/auth/profile";

export const metadata = { title: "Verify Your Email | ColdReach AI", description: "Please verify your email address to continue." };

export default async function VerifyEmailPendingPage() {
  const profile = await getCurrentUserProfile();
  const email = profile.status === "success" ? profile.data.email : null;

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#faf8ff] p-8">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#004ac6]/10 text-[#004ac6]">
          <Mail className="size-8" />
        </div>
        <h1 className="mb-2 text-3xl leading-10 font-bold tracking-[-.01em] text-[#191b23]">Verify your email</h1>
        <p className="mb-2 text-base leading-6 text-[#434655]">
          We&apos;ve sent a verification link to your email address.
        </p>
        {email && (
          <p className="mb-8 text-sm leading-5 font-medium text-[#191b23]">{email}</p>
        )}
        <p className="mb-8 text-sm leading-5 text-[#737686]">
          Please check your inbox and click the verification link to continue. If you don&apos;t see the email, check your spam folder.
        </p>
        <ResendVerificationButton />
      </div>
    </main>
  );
}
