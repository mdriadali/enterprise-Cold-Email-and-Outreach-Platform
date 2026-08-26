
import { PLAN_LIMITS } from "@repo/config/src/subscription/PlanLimits";
import { requireSession, requireEmailVerification } from "../../src/auth/require-session";
import { PricingPage } from "./pricing-client";

export const metadata = { title: "Choose a Plan | ColdReach AI", description: "Select a subscription plan for your new workspace." };

export default async function NewWorkspacePage() {
  await requireSession();
  await requireEmailVerification();

  return <PricingPage planLimits={PLAN_LIMITS} />;
}
