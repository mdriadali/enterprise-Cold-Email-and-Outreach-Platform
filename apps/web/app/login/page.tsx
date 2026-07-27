import { BrandShowcase } from "../src/components/auth/brand-showcase";
import { SignInForm } from "../src/components/auth/sign-in-form";



export const metadata = { title: "Sign in | ColdReach AI", description: "Sign in to your ColdReach AI enterprise workspace." };

export default function LogInPage() {
  return <main className="flex min-h-svh overflow-hidden"><BrandShowcase variant="dark" /><SignInForm /></main>;
}
