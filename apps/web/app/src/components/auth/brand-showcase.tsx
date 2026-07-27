import { webEnv } from "@repo/env/web-env";
import { Bolt, TrendingUp, BarChart3, BadgeCheck, Network } from "lucide-react";

export function BrandShowcase({ variant = "light" }: { variant?: "light" | "dark" }) {
  if (variant === "dark") {
    return (
      <section className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#f3f3fe] lg:flex" aria-label="ColdReach AI overview">
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-[rgb(0_74_198_/_0.08)] opacity-65 blur-[64px]" />
      <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-[rgb(0_106_99_/_0.08)] opacity-65 blur-[64px]" />
      <div className="absolute inset-0 opacity-35 [background:linear-gradient(135deg,transparent_0_43%,rgb(255_255_255_/_0.6)_43.2%_44%,transparent_44.2%_100%),linear-gradient(45deg,transparent_0_67%,rgb(128_139_170_/_0.15)_67.2%_67.5%,transparent_67.7%_100%)]" />
        <div className="relative z-10 w-full max-w-lg px-8">
          <div className="mb-12 flex items-center gap-4"><div className="grid size-12 place-items-center rounded-lg bg-[#2563eb] text-white"><Network className="size-7" fill="currentColor" /></div><span className="text-2xl leading-8 font-semibold tracking-tight text-[#191b23]">{webEnv.APP_NAME}</span></div>
          <div className="rounded-xl border border-white/55 bg-white/55 p-8 shadow-[0_8px_32px_rgb(28_33_67_/_0.14)] backdrop-blur-[20px]">
            <h2 className="mb-6 text-5xl leading-14 font-extrabold tracking-[-.02em] text-[#191b23]">Enterprise Outreach Intelligence</h2>
            <div className="space-y-4 text-sm leading-5 font-semibold tracking-[.05em] text-[#434655]"><div className="flex items-center gap-4"><BarChart3 className="size-6 text-[#004ac6]" fill="currentColor" />Real-time Analytics</div><div className="flex items-center gap-4"><BadgeCheck className="size-6 text-[#004ac6]" fill="currentColor" />High Deliverability</div></div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8"><Metric label="Processing" value="1.2M+" description="Leads per day" /><Metric label="Uptime" value="99.9%" description="SLA Guaranteed" /></div>
        </div>
      </section>
    );
  }
  return (
    <section className="relative hidden items-center justify-center overflow-hidden bg-[#f3f3fe] p-12 xl:flex" aria-label="ColdReach AI overview">
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-[rgb(0_74_198_/_0.08)] opacity-65 blur-[64px]" />
      <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-[rgb(0_106_99_/_0.08)] opacity-65 blur-[64px]" />
      <div className="absolute inset-0 opacity-35 [background:linear-gradient(135deg,transparent_0_43%,rgb(255_255_255_/_0.6)_43.2%_44%,transparent_44.2%_100%),linear-gradient(45deg,transparent_0_67%,rgb(128_139_170_/_0.15)_67.2%_67.5%,transparent_67.7%_100%)]" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-lg bg-[#004ac6] text-white" aria-hidden="true">
              <Bolt size={23} fill="currentColor" strokeWidth={2.6} />
            </div>
            <span className="text-2xl leading-8 font-semibold tracking-[-0.01em] text-[#191b23]">{webEnv.APP_NAME}</span>
          </div>

          <h1 className="mb-4 text-5xl leading-[1.16] font-extrabold tracking-[-0.02em] text-[#191b23]">
            Enterprise <br />
            Outreach <br />
            Intelligence
          </h1>
          <p className="max-w-md text-lg leading-7 text-[#434655]">
            The definitive platform for strategic relationship management and
            precision-driven global expansion.
          </p>
        </div>

        <div className="rounded-xl border border-white/55 bg-white/28 p-8 shadow-[0_22px_50px_rgb(28_33_67_/_0.14)] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-[#c3c6d7]/50 pb-4">
            <div>
              <p className="text-xs leading-4 font-medium tracking-[0.14em] text-[#004ac6] uppercase">Active Intelligence</p>
              <p className="mt-[3px] text-2xl leading-8 font-semibold tracking-[-0.01em] text-[#191b23]">84% Engagement</p>
            </div>
            <div className="grid size-12 place-items-center rounded-full bg-[#004ac6]/10 text-[#004ac6]" aria-hidden="true">
              <TrendingUp size={23} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm leading-5 text-[#434655]">
              <span>Lead Conversion Rate</span>
              <strong className="font-semibold tracking-[0.05em] text-[#191b23]">+12.4%</strong>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e1e2ed]" aria-label="84 percent engagement">
              <div className="h-full w-[84%] rounded-full bg-[#004ac6]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, description }: { label: string; value: string; description: string }) {
  return <div className="border-l border-[#004ac6]/25 pl-4"><p className="mb-1 text-xs leading-4 font-medium tracking-[.15em] text-[#737686] uppercase">{label}</p><p className="text-2xl leading-8 font-semibold text-[#191b23]">{value}</p><p className="text-xs leading-4 text-[#434655]">{description}</p></div>;
}
