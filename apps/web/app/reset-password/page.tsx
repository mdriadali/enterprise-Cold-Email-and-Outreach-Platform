import { redirect } from "next/navigation";
import { BrandShowcase } from "../src/components/auth/brand-showcase";
import { ResetPasswordForm } from "../src/components/auth/reset-password-form";

export const metadata = { title: "Reset Password | ColdReach AI", description: "Set a new password for your ColdReach AI account." };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) {
  const params = await searchParams;

  if (!params.email || !params.token) {
    redirect("/forgot-password");
  }

  return <main className="flex min-h-svh overflow-hidden"><BrandShowcase variant="dark" /><ResetPasswordForm email={params.email} token={params.token} /></main>;
}
