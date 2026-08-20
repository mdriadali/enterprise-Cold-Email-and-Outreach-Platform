import { BrandShowcase } from "../src/components/auth/brand-showcase";
import { ForgotPasswordForm } from "../src/components/auth/forgot-password-form";

export const metadata = { title: "Forgot Password | ColdReach AI", description: "Reset your ColdReach AI account password." };

export default function ForgotPasswordPage() {
  return <main className="flex min-h-svh overflow-hidden"><BrandShowcase variant="dark" /><ForgotPasswordForm /></main>;
}
