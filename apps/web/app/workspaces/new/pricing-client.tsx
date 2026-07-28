"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, Zap, Megaphone, Key, AtSign, Mail, X, HelpCircle, ShieldCheck, Clock, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import type { PLAN_LIMITS } from "@repo/config/src/subscription/PlanLimits";
import { useNotification } from "@repo/ui/notification-provider";
import { createWorkspace } from "../../src/actions/workspace/create-workspace";

type PlanKey = keyof typeof PLAN_LIMITS;
type FeatureKey = Exclude<keyof (typeof PLAN_LIMITS)[PlanKey], "price">;

const featureMeta: Record<FeatureKey, { label: string; icon: React.ElementType }> = {
  workspaces: { label: "Workspaces", icon: Users },
  members: { label: "Members", icon: Users },
  generationJobs: { label: "Generation Jobs", icon: Zap },
  campaigns: { label: "Campaigns", icon: Megaphone },
  apiKeys: { label: "API Keys", icon: Key },
  smtpAccounts: { label: "SMTP Accounts", icon: AtSign },
  mailSentDaily: { label: "Mails Daily", icon: Mail },
};

const planNames: Record<PlanKey, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ULTRA: "Ultra",
};

const planColors: Record<PlanKey, {
  card: string;
  label: string;
  price: string;
  priceMeta: string;
  button: string;
  featureIcon: string;
  featureText: string;
  featureBold: boolean;
  inverted?: boolean;
}> = {
  STARTER: {
    card: "bg-[#ffffff] border border-[#c3c6d7]",
    label: "text-[#434655] opacity-60",
    price: "text-[#191b23]",
    priceMeta: "text-[#434655]",
    button: "bg-[#e1e2ed] hover:bg-[#c3c6d7] text-[#191b23] border border-[#c3c6d7]",
    featureIcon: "text-[#004ac6]",
    featureText: "text-[#434655]",
    featureBold: false,
  },
  PROFESSIONAL: {
    card: "bg-[#ffffff] border-2 border-[#2563eb]",
    label: "text-[#004ac6] font-bold",
    price: "text-[#191b23]",
    priceMeta: "text-[#434655]",
    button: "bg-[#2563eb] hover:bg-[#004ac6] text-[#ffffff]",
    featureIcon: "text-[#004ac6]",
    featureText: "text-[#191b23]",
    featureBold: true,
  },
  ULTRA: {
    card: "bg-[#2e3039] border border-[#737686]",
    label: "text-[#b4c5ff]",
    price: "text-[#f0f0fb]",
    priceMeta: "text-[#737686]",
    button: "bg-[#632ecd] hover:bg-[#5516be] text-[#ffffff]",
    featureIcon: "text-[#b4c5ff]",
    featureText: "text-[#f0f0fb]",
    featureBold: false,
    inverted: true,
  },
};

type PlanLimitsData = Record<PlanKey, Record<string, number>>;

export function PricingPage({ planLimits }: { planLimits: PlanLimitsData }) {
  const router = useRouter();
  const { notify } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planKeys = Object.keys(planLimits) as PlanKey[];

  // Collect all unique feature keys across all plans (excluding price)
  const allFeatureKeys = new Set<keyof (typeof planLimits)[PlanKey]>();
  for (const key of planKeys) {
    for (const fk of Object.keys(planLimits[key]!) as (keyof (typeof planLimits)[PlanKey])[]) {
      if (fk !== "price") allFeatureKeys.add(fk);
    }
  }

  const openModal = useCallback((plan: PlanKey) => {
    setSelectedPlan(plan);
    setWorkspaceName("");
    setError(null);
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedPlan) return;
    const trimmed = workspaceName.trim();
    if (trimmed.length < 2) {
      setError("Workspace name must be at least 2 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("name", trimmed);
    fd.set("subscription", selectedPlan);

    const result = await createWorkspace(fd);
    if (result.status === "error") {
      setError(result.message);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setModalOpen(false);
    notify({ title: "Workspace created", message: `"${trimmed}" is ready.`, tone: "success" });
    router.push(`/workspace/${result.workspaceId}`);
  }, [selectedPlan, workspaceName, router, notify]);

  return (
    <>
      <main className="relative w-full max-w-[1440px] mx-auto px-[32px] py-[48px] flex flex-col items-center">
        <header className="text-center mb-[32px] w-full max-w-4xl">
          <div className="inline-flex items-center gap-[8px] mb-[16px] px-[16px] py-[4px] rounded-full bg-[#f3f3fe] border border-[#c3c6d7]">
            <Sparkles className="size-[18px] text-[#004ac6]" />
            <span className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Workspace Setup</span>
          </div>
          <h1 className="text-[48px] leading-[56px] font-extrabold tracking-[-0.02em] text-[#191b23] mb-[16px]">Choose Your Workspace Plan</h1>
          <p className="text-[18px] leading-[28px] text-[#434655] max-w-2xl mx-auto">
            Scale your outreach with intelligence and precision. Select a plan that fits your operational complexity.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] w-full items-stretch">
          {planKeys.map((planKey) => {
            const plan = planLimits[planKey]!;
            const colors = planColors[planKey]!;
            const price = plan.price;
            const isPopular = planKey === "PROFESSIONAL";
            const features = ([...allFeatureKeys] as FeatureKey[]).filter((fk) => fk in planLimits[planKey]);

            return (
              <div
                key={planKey}
                className={`${colors.card} rounded-xl p-[32px] flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] hover:border-[#2563eb]`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 overflow-hidden">
                    <div className="bg-[#2563eb] text-white text-[11px] leading-[16px] font-semibold uppercase tracking-tighter px-[24px] py-[8px] transform rotate-45 translate-x-[35px] translate-y-[5px] w-[140px] text-center">
                      Popular
                    </div>
                  </div>
                )}

                <div className="mb-[24px]">
                  <span className={`text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase ${colors.label}`}>
                    {planNames[planKey]}
                  </span>
                  <div className="flex items-baseline mt-[8px]">
                    <span className={`text-[36px] leading-[44px] font-bold tracking-[-0.01em] ${colors.price}`}>
                      ${price}
                    </span>
                    <span className={`text-[16px] leading-[24px] ml-[8px] ${colors.priceMeta}`}>
                      /mo
                    </span>
                  </div>
                </div>

                <div className="flex-grow space-y-[16px] mb-[32px]">
                  {features.map((fk) => {
                    const meta = featureMeta[fk];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    const value = plan[fk];
                    return (
                      <div key={fk} className="flex items-start gap-[16px]">
                        <Icon className={`size-5 shrink-0 mt-0.5 ${colors.featureIcon}`} strokeWidth={1.5} fill="currentColor" />
                        <span className={`text-[16px] leading-[24px] ${colors.featureText}${colors.featureBold ? " font-medium" : ""}`}>
                          {value} {meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto">
                  {planKey === "STARTER" && (
                    <div className="bg-[#f3f3fe] rounded-lg p-[16px] border border-[#c3c6d7] mb-[24px]">
                      <p className="text-[14px] leading-[20px] text-[#434655] italic">Note: Limit 1 free workspace per account.</p>
                    </div>
                  )}
                  <button
                    onClick={() => openModal(planKey)}
                    className={`w-full text-[14px] leading-[20px] font-semibold tracking-[0.05em] py-[16px] rounded-lg transition-all active:scale-[0.98] ${colors.button}${planKey === "PROFESSIONAL" ? " shadow-md" : ""}${planKey === "ULTRA" ? " shadow-lg" : ""}`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="mt-[48px] border-t border-[#c3c6d7] w-full pt-[32px] flex flex-col md:flex-row justify-between items-center gap-[16px]">
          <div className="flex items-center gap-[16px] text-[#434655]">
            <HelpCircle className="size-5" />
            <span className="text-[14px] leading-[20px]">Need a custom enterprise solution?</span>
            <Link className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#004ac6] hover:underline transition-all" href="#">Contact Sales</Link>
          </div>
          <div className="flex items-center gap-[32px]">
            <div className="flex items-center gap-[8px]">
              <ShieldCheck className="size-[16px] text-[#434655]" />
              <span className="text-[12px] leading-[16px] text-[#434655]">Secure Payment</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <Clock className="size-[16px] text-[#434655]" />
              <span className="text-[12px] leading-[16px] text-[#434655]">Cancel Anytime</span>
            </div>
          </div>
        </footer>

        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#004ac6] opacity-[0.03] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#632ecd] opacity-[0.03] blur-[120px] rounded-full" />
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#e1e2ed 0.5px, transparent 0.5px)", backgroundSize: "24px 24px", opacity: 0.3 }} />
        </div>
      </main>

      {modalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.2)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Name Your Workspace</h2>
              <button
                onClick={() => !submitting && setModalOpen(false)}
                className="p-2 text-[#737686] hover:bg-[#f3f3fe] rounded-lg transition-colors"
                disabled={submitting}
                type="button"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-[#f3f3fe] border border-[#c3c6d7]">
                <div className={`size-10 rounded-lg flex items-center justify-center text-white bg-[#2563eb]`}>
                  {selectedPlan === "STARTER" ? <Zap className="size-5" /> : selectedPlan === "PROFESSIONAL" ? <Users className="size-5" /> : <Megaphone className="size-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#191b23]">{planNames[selectedPlan]} Plan</p>
                  <p className="text-xs text-[#434655]">${planLimits[selectedPlan]!.price}/mo</p>
                </div>
              </div>

              <label className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#434655] block mb-1.5">Workspace Name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => { setWorkspaceName(e.target.value); setError(null); }}
                placeholder="e.g. Acme Corp Outreach"
                className="w-full px-4 py-2.5 bg-white border border-[#c3c6d7] rounded-lg text-[#191b23] text-base leading-6 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-colors placeholder:text-[#737686]"
                autoFocus
                disabled={submitting}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-[#8b1e1e] text-xs leading-4">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 pt-2 flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#f3f3fe] hover:bg-[#e1e2ed] text-[#191b23] text-sm font-semibold tracking-[0.05em] rounded-lg transition-colors border border-[#c3c6d7] disabled:opacity-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#2563eb] hover:bg-[#004ac6] text-white text-sm font-semibold tracking-[0.05em] rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                type="button"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
