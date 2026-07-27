import { BrandShowcase } from "../src/components/auth/brand-showcase";
import { RegistrationForm } from "../src/components/auth/registration-form";


export const metadata = { title: "Create account | ColdReach AI", description: "Create your ColdReach AI enterprise workspace." };

export default function RegisterPage() {
  return <main className="grid min-h-svh grid-cols-1 overflow-hidden xl:grid-cols-2"><BrandShowcase /><RegistrationForm /></main>;
}