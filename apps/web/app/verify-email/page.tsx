import { redirect } from "next/navigation";
import { BrandShowcase } from "../src/components/auth/brand-showcase";
import { VerifyEmailForm } from "../src/components/auth/verify-email-form";

export const metadata = { title: "Verify Email | ColdReach AI", description: "Verify your ColdReach AI email address." };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) {
  const params = await searchParams;

  if (!params.email || !params.token) {
    redirect("/login");
  }

  return <main className="flex min-h-svh overflow-hidden"><BrandShowcase variant="dark" /><VerifyEmailForm email={params.email} token={params.token} /></main>;
}
