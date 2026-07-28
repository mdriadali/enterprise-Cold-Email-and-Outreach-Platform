"use client";

import { useState } from "react";
import { Settings, Users, Sparkles, Megaphone, Key, AtSign, Send, Copy, Check, MoreHorizontal, ShieldCheck, HelpCircle, Bell, Phone, Mail, UserPlus, ChevronDown, Edit3, FilePenLine, LayoutDashboard, BarChart3, Rocket, MoreVertical } from "lucide-react";
import type { WorkspaceInfoData } from "../../../src/actions/workspace/workspace-info";

type DashboardClientProps = {
  info: WorkspaceInfoData;
  limits: Record<string, number>;
  planDisplayName: string;
};

const subscriptionColors: Record<string, string> = {
  STARTER: "bg-[#dbe1ff] text-[#003ea8]",
  PROFESSIONAL: "bg-[#2563eb] text-[#eeefff]",
  ULTRA: "bg-[#632ecd] text-[#f6edff]",
};

const cardMeta: Record<string, { label: string; icon: React.ElementType; color: string; barColor: string; countKey: string; limitKey: string }> = {
  members: { label: "Members", icon: Users, color: "text-[#004ac6]", barColor: "bg-[#004ac6]", countKey: "members", limitKey: "members" },
  generationJobs: { label: "Generation Jobs", icon: Sparkles, color: "text-[#632ecd]", barColor: "bg-[#632ecd]", countKey: "generationJob", limitKey: "generationJobs" },
  campaigns: { label: "Active Campaigns", icon: Megaphone, color: "text-[#006a63]", barColor: "bg-[#006a63]", countKey: "campaign", limitKey: "campaigns" },
  apiKeys: { label: "API Keys", icon: Key, color: "text-[#191b23]", barColor: "bg-[#191b23]", countKey: "AiApiKeys", limitKey: "apiKeys" },
  smtpAccounts: { label: "SMTP Accounts", icon: AtSign, color: "text-[#004ac6]", barColor: "bg-[#004ac6]", countKey: "smtpAccounts", limitKey: "smtpAccounts" },
  dailyMails: { label: "Daily Mails", icon: Send, color: "text-[#93000a]", barColor: "bg-[#93000a]", countKey: "" as string, limitKey: "mailSentDaily" },
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "N/A";
  }
}

export function DashboardClient({ info, limits, planDisplayName }: DashboardClientProps) {
  const [copied, setCopied] = useState(false);
  const subColor = subscriptionColors[info.subscription] ?? subscriptionColors.STARTER!;
  const usageCards = Object.entries(cardMeta).map(([key, meta]) => {
    const count = meta.countKey ? (info._count as Record<string, number>)[meta.countKey] ?? 0 : 0;
    const limit = limits[meta.limitKey] ?? 1;
    const pct = Math.min(Math.round((count / limit) * 100), 100);
    return { key, meta, count, limit, pct };
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(info.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const initials = (name: string) =>
    name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

  const avatarColors = ["bg-[#dbe1ff] text-[#00174b]", "bg-[#9cf2e8] text-[#00201d]", "bg-[#e9ddff] text-[#23005c]"];

  return (
    <div className="min-h-0 flex-1 overflow-auto p-[32px] space-y-[24px] custom-scrollbar">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-[24px]">
        <div className="space-y-[4px]">
          <div className="flex items-center gap-[8px]">
            <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">{info.name}</h1>
            <span className={`px-[8px] py-[4px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] rounded-full ${subColor}`}>
              {planDisplayName}
            </span>
          </div>
          <p className="text-[16px] leading-[24px] text-[#434655]">Manage your organizational workspace settings and resource distribution.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-[8px] px-[24px] py-[16px] bg-[#004ac6] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em] rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm" type="button">
          <Settings className="size-5" />
          Manage Workspace
        </button>
      </header>

      <section className="space-y-[24px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Resource Consumption</h2>
          <div className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#737686] flex items-center gap-[4px]">
            <HelpCircle className="size-[16px]" />
            Updates every 15 minutes
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {usageCards.map(({ key, meta, count, limit, pct }) => {
            const Icon = meta.icon;
            return (
              <div key={key} className="bg-white/80 backdrop-blur-[12px] p-[24px] rounded-xl border border-[#e1e2ed] flex flex-col justify-between hover:border-[#004ac6]/30 transition-colors">
                <div className="flex justify-between items-start mb-[16px]">
                  <div>
                    <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] uppercase">{meta.label}</p>
                    <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mt-[4px]">
                      {count} <span className="text-[#434655]/40 text-[16px] leading-[24px] font-normal">/ {limit}</span>
                    </h3>
                  </div>
                  <div className="p-[8px] bg-[#ededf9] rounded-lg">
                    <Icon className={`size-5 ${meta.color}`} strokeWidth={1.5} fill="currentColor" />
                  </div>
                </div>
                <div className="space-y-[8px]">
                  <div className="flex justify-between text-[12px] leading-[16px] font-semibold tracking-[0.05em]">
                    <span className="text-[#434655]">Utilization</span>
                    <span className={`font-bold ${meta.color}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-[#e7e7f3] h-2 rounded-full overflow-hidden">
                    <div className={`${meta.barColor} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-[32px]">
        <div className="lg:col-span-2 space-y-[24px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Workspace Members</h2>
            <button className="text-[#004ac6] text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:underline" type="button">+ Invite Member</button>
          </div>
          <div className="bg-white/80 backdrop-blur-[12px] rounded-xl overflow-hidden border border-[#c3c6d7]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f3fe] border-b border-[#c3c6d7]">
                <tr>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">MEMBER</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">ROLE</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">STATUS</th>
                  <th className="px-[24px] py-[16px]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d7]">
                {info.members.map((member, i) => (
                  <tr key={member.id} className="hover:bg-[#f3f3fe] transition-colors duration-200">
                    <td className="px-[24px] py-[16px]">
                      <div className="flex items-center gap-[16px]">
                        <div className={`size-10 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-sm font-bold`}>
                          {initials(member.user.name)}
                        </div>
                        <div>
                          <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">{member.user.name}</p>
                          <p className="text-[12px] leading-[16px] text-[#434655]">{member.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <span className="px-[8px] py-1 bg-[#e1e2ed] rounded text-[#434655] text-[14px] leading-[20px] font-medium">{member.role === "OWNER" ? "Owner" : "Member"}</span>
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <div className="flex items-center gap-[4px] text-[14px] leading-[20px] text-[#006a63]">
                        <span className="size-2 rounded-full bg-[#006a63]" /> Active
                      </div>
                    </td>
                    <td className="px-[24px] py-[16px] text-right">
                      <button className="p-[8px] hover:bg-[#e7e7f3] rounded-full text-[#434655]" type="button">
                        <MoreHorizontal className="size-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-[24px]">
          <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Workspace Identity</h2>
          <div className="bg-white/80 backdrop-blur-[12px] p-[24px] rounded-xl space-y-[16px] border border-[#c3c6d7]">
            <div className="space-y-[4px]">
              <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase tracking-wider">Workspace ID</label>
              <div className="flex items-center justify-between bg-[#f3f3fe] p-[8px] rounded border border-[#c3c6d7]/30">
                <code className="font-mono text-sm text-[#004ac6]">{info.id}</code>
                <button onClick={handleCopy} className="text-[#737686] hover:text-[#004ac6] transition-colors" type="button" aria-label="Copy workspace ID">
                  {copied ? <Check className="size-[18px] text-[#006a63]" /> : <Copy className="size-[18px]" />}
                </button>
              </div>
            </div>
            <div className="pt-[16px] border-t border-[#c3c6d7]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase tracking-wider">Created At</p>
                  <p className="text-[16px] leading-[24px] text-[#191b23] mt-[4px]">N/A</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase tracking-wider">Timezone</p>
                  <p className="text-[16px] leading-[24px] text-[#191b23] mt-[4px]">UTC</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-[24px] bg-[#f3f3fe] rounded-xl border border-dashed border-[#c3c6d7]">
            <div className="flex gap-[16px] items-start">
              <ShieldCheck className="size-6 text-[#004ac6] shrink-0" />
              <div className="space-y-[4px]">
                <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">Compliance Verified</p>
                <p className="text-[14px] leading-[20px] text-[#434655]">This workspace is fully configured for enterprise cold outreach in compliance with regional regulations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
