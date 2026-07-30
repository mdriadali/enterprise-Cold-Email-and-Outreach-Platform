"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send, RefreshCw, Mail, Star, Filter, PlusCircle, Edit, Trash2,
  ChevronLeft, ChevronRight, Clock, Info, Lightbulb
} from "lucide-react";
import type { WorkspaceInfoData, CampaignInfo } from "../../../../src/actions/workspace/workspace-info";

type CampaignsClientProps = {
  info: WorkspaceInfoData;
  limits: Record<string, number>;
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-[#e1e2ed] text-[#434655]",
  DRAFT: "bg-[#e1e2ed] text-[#434655]",
  PAUSED: "bg-[#ffdad6] text-[#ba1a1a]",
  PROCESSING: "bg-[#dbe1ff] text-[#004ac6]",
  RUNNING: "bg-[#dbe1ff] text-[#004ac6]",
  QUEUED: "bg-[#dbe1ff] text-[#004ac6]",
  SCHEDULED: "bg-[#dbe1ff] text-[#004ac6]",
  COMPLETED: "bg-[#99efe5] text-[#006a63]",
  FAILED: "bg-[#ba1a1a] text-[#ffffff]",
  CANCELLED: "bg-[#e1e2ed] text-[#434655]",
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return "Today, " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Yesterday, " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

function getScheduleLabel(campaign: CampaignInfo) {
  if (campaign.status === "COMPLETED" && campaign.endAt) {
    const d = new Date(campaign.endAt);
    return `Ended ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  if (campaign.status === "SCHEDULED" && campaign.startAt) {
    return formatDate(campaign.startAt) ?? "Scheduled";
  }
  if (campaign.status === "RUNNING" && campaign.nextRunAt) {
    return formatDate(campaign.nextRunAt) ?? "Running";
  }
  if (campaign.status === "PAUSED") return "Manual Resume";
  if (campaign.status === "PENDING" || campaign.status === "DRAFT") return "Waiting for Assets";
  if (campaign.status === "CANCELLED") return "Cancelled";
  if (campaign.status === "FAILED") return campaign.error ?? "Failed";
  return "—";
}

function getPerformancePercent(campaign: CampaignInfo) {
  if (campaign.status === "COMPLETED") return 100;
  if (campaign.status === "RUNNING" || campaign.status === "PROCESSING") return 72;
  if (campaign.status === "SCHEDULED" || campaign.status === "QUEUED") return 15;
  if (campaign.status === "PAUSED") return 15;
  if (campaign.status === "DRAFT" || campaign.status === "PENDING") return 0;
  if (campaign.status === "CANCELLED" || campaign.status === "FAILED") return 0;
  return 0;
}

function getLeadCount(campaign: CampaignInfo) {
  if (!campaign.description) return null;
  const match = campaign.description.match(/(\d[\d,.]*)\s*leads/i);
  if (match) return match[1];
  return null;
}

function getTimezoneShort(tz: string) {
  if (tz === "America/New_York") return "America/New_York";
  if (tz === "Europe/London") return "Europe/London";
  if (tz === "America/Los_Angeles") return "America/Los_Angeles";
  if (tz.startsWith("UTC") || tz.startsWith("Etc/")) return tz;
  return tz;
}

export function CampaignsClient({ info, limits }: CampaignsClientProps) {
  const router = useRouter();
  const totalCampaigns = info._count.campaign;
  const activeSequences = info.campaign.filter(
    (c) => c.status === "SCHEDULED" || c.status === "RUNNING" || c.status === "QUEUED" || c.status === "PROCESSING"
  ).length;
  const dailyLimitTotal = info.campaign.reduce((sum, c) => sum + c.dailyLimit, 0);
  const dailySentEstimate = Math.min(dailyLimitTotal, limits.mailSentDaily ?? 50);
  const dailyLimitPct = Math.round((dailySentEstimate / (limits.mailSentDaily ?? 50)) * 100);
  const sentDisplay = dailySentEstimate.toLocaleString();

  return (
    <div className="min-h-0 flex-1 overflow-auto p-[32px] space-y-[24px] custom-scrollbar">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">Campaigns</h2>
          <p className="text-[16px] leading-[24px] text-[#434655]">Monitor and manage your high-performance outreach sequences.</p>
        </div>
        <div className="flex gap-[16px]">
          <button className="flex items-center gap-[8px] bg-white border border-[#c3c6d7] px-[24px] py-[16px] rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#f3f3fe] transition-colors" type="button">
            <Filter className="size-5" />
            Filter
          </button>
          <Link href={`/workspace/${info.id}/campaigns/create`} className="flex items-center gap-[8px] bg-[#004ac6] text-white px-[24px] py-[16px] rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
            <PlusCircle className="size-5" />
            Create New Campaign
          </Link>
        </div>
      </div>

      {/* Stat Overview (Bento Style Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        <div className="bg-white/80 backdrop-blur-[8px] p-[24px] rounded-xl border border-[#c3c6d7] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-[16px]">
            <div className="p-[8px] bg-[#2563eb]/10 rounded-lg">
              <Send className="size-5 text-[#004ac6]" strokeWidth={1.5} />
            </div>
            <span className="text-[#006a63] text-[14px] leading-[20px] font-semibold tracking-[0.05em]">+12% vs LW</span>
          </div>
          <div>
            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Total Campaigns</p>
            <p className="text-[24px] leading-[32px] font-bold tracking-[-0.01em] text-[#191b23] mt-[4px]">{totalCampaigns}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-[8px] p-[24px] rounded-xl border border-[#c3c6d7] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-[16px]">
            <div className="p-[8px] bg-[#99efe5]/10 rounded-lg">
              <RefreshCw className="size-5 text-[#006a63]" strokeWidth={1.5} />
            </div>
            <span className="text-[#006a63] text-[14px] leading-[20px] font-semibold tracking-[0.05em]">18 New Leads</span>
          </div>
          <div>
            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Active Sequences</p>
            <p className="text-[24px] leading-[32px] font-bold tracking-[-0.01em] text-[#191b23] mt-[4px]">{activeSequences}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-[8px] p-[24px] rounded-xl border border-[#c3c6d7] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-[16px]">
            <div className="p-[8px] bg-[#7d4ce7]/10 rounded-lg">
              <Mail className="size-5 text-[#632ecd]" strokeWidth={1.5} />
            </div>
            <span className="text-[#434655] text-[14px] leading-[20px] font-semibold tracking-[0.05em]">{dailyLimitPct}% of Limit</span>
          </div>
          <div>
            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Daily Emails Sent</p>
            <p className="text-[24px] leading-[32px] font-bold tracking-[-0.01em] text-[#191b23] mt-[4px]">{sentDisplay}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-[8px] p-[24px] rounded-xl border border-[#c3c6d7] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-[16px]">
            <div className="p-[8px] bg-[#2563eb]/10 rounded-lg">
              <Star className="size-5 text-[#004ac6]" strokeWidth={1.5} fill="currentColor" />
            </div>
            <span className="text-[#006a63] text-[14px] leading-[20px] font-semibold tracking-[0.05em]">+2.4%</span>
          </div>
          <div>
            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Avg Reply Rate</p>
            <p className="text-[24px] leading-[32px] font-bold tracking-[-0.01em] text-[#191b23] mt-[4px]">14.8%</p>
          </div>
        </div>
      </div>

      {/* Table and Scheduling Layout */}
      <div className="flex flex-col lg:flex-row gap-[24px] items-start">
        {/* Campaign List (3/4) */}
        <div className="w-full lg:w-3/4 bg-white/80 backdrop-blur-[8px] rounded-xl overflow-hidden border border-[#c3c6d7]">
          <div className="px-[24px] py-[16px] border-b border-[#c3c6d7] bg-white flex justify-between items-center">
            <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Recent Campaigns</h3>
            <div className="flex gap-[8px]">
              <span className="bg-[#ededf9] text-[#434655] px-[8px] py-[4px] rounded text-[12px] leading-[16px] font-semibold tracking-[0.05em]">Total: {totalCampaigns}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f3fe] text-[#434655] border-b border-[#c3c6d7]">
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase">Campaign Name</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase">Status</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase">Schedule</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase">Timezone</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase">Daily Limit</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase">Performance</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d7]">
                {info.campaign.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-[24px] py-[48px] text-center text-[16px] leading-[24px] text-[#434655]">
                      No campaigns yet. Create your first campaign to get started.
                    </td>
                  </tr>
                ) : (
                  info.campaign.map((campaign) => {
                    const perf = getPerformancePercent(campaign);
                    const leadCount = getLeadCount(campaign);
                    const scheduleLabel = getScheduleLabel(campaign);
                    return (
                      <tr key={campaign.id} className="hover:bg-[#f3f3fe] transition-colors group cursor-pointer" onClick={() => router.push(`/workspace/${info.id}/campaigns/${campaign.id}`)}>
                        <td className="px-[24px] py-[16px]">
                          <div className="flex flex-col">
                            <Link href={`/workspace/${info.id}/campaigns/${campaign.id}`} className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#004ac6] font-bold hover:underline">{campaign.name}</Link>
                            <span className="text-[12px] leading-[16px] text-[#434655]">
                              {leadCount ? `${leadCount} leads` : (campaign.description ?? "No description")}
                            </span>
                          </div>
                        </td>
                        <td className="px-[24px] py-[16px]">
                          <span className={`px-[8px] py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[campaign.status] ?? statusStyles.PENDING}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-[24px] py-[16px] text-[14px] leading-[20px] text-[#434655]">{scheduleLabel}</td>
                        <td className="px-[24px] py-[16px] text-[14px] leading-[20px] text-[#434655]">
                          <div className="flex items-center gap-[4px]">
                            <span>{getTimezoneShort(campaign.timezone)}</span>
                            <button className="text-[#004ac6] hover:underline text-[10px] font-bold">EDIT</button>
                          </div>
                        </td>
                        <td className="px-[24px] py-[16px] text-[14px] leading-[20px]">
                          <div className="flex items-center gap-[4px]">
                            <span className="font-bold">{campaign.dailyLimit}</span>
                            <span className="text-[#434655]">/ day</span>
                          </div>
                        </td>
                        <td className="px-[24px] py-[16px]">
                          <div className="flex items-center gap-[16px]">
                            <div className="w-24 h-2 bg-[#ededf9] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${perf > 0 ? "bg-[#006a63]" : "bg-[#e1e2ed]"}`}
                                style={{ width: `${perf}%` }}
                              />
                            </div>
                            <span className={`text-[12px] leading-[16px] font-semibold tracking-[0.05em] font-bold ${perf > 0 ? "text-[#006a63]" : "text-[#434655]"}`}>
                              {perf}%
                            </span>
                          </div>
                        </td>
                        <td className="px-[24px] py-[16px] text-right">
                          <div className="flex justify-end gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-[4px] hover:bg-[#dbe1ff] rounded transition-colors" type="button">
                              <Edit className="size-[18px] text-[#004ac6]" />
                            </button>
                            <button className="p-[4px] hover:bg-[#ffdad6] rounded transition-colors" type="button">
                              <Trash2 className="size-[18px] text-[#ba1a1a]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-[24px] py-[16px] bg-white border-t border-[#c3c6d7] flex justify-between items-center">
            <span className="text-[14px] leading-[20px] text-[#434655]">Showing 1 to {Math.min(info.campaign.length, 10)} of {totalCampaigns} campaigns</span>
            <div className="flex gap-[8px]">
              <button className="p-[4px] border border-[#c3c6d7] rounded hover:bg-[#f3f3fe] transition-colors" type="button">
                <ChevronLeft className="size-5 text-[#737686]" />
              </button>
              <button className="p-[4px] border border-[#c3c6d7] rounded hover:bg-[#f3f3fe] transition-colors" type="button">
                <ChevronRight className="size-5 text-[#737686]" />
              </button>
            </div>
          </div>
        </div>

        {/* Global Scheduling Sidebar (1/4) */}
        <div className="w-full lg:w-1/4 flex flex-col gap-[24px]">
          {/* Global Workspace Rules */}
          <div className="bg-white/80 backdrop-blur-[8px] rounded-xl p-[24px] border border-[#c3c6d7]">
            <div className="flex items-center gap-[8px] mb-[24px]">
              <Clock className="size-5 text-[#004ac6]" />
              <h4 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] font-bold text-[#191b23]">Global Workspace Rules</h4>
            </div>
            <div className="space-y-[24px]">
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Timezone</span>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] leading-[20px] font-semibold">America/New_York (EST)</span>
                  <button className="text-[#004ac6] text-[12px] leading-[16px] font-semibold tracking-[0.05em]">Edit</button>
                </div>
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Active Window</span>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] leading-[20px] font-semibold">08:00 AM - 06:00 PM</span>
                  <span className="text-[#006a63] font-bold text-[12px] leading-[16px]">LIVE</span>
                </div>
              </div>
             
              <div className="pt-[24px] border-t border-[#c3c6d7]">
                <div className="flex items-center justify-between mb-[8px]">
                  <span className="text-[14px] leading-[20px] font-medium">Daily Send Buffer</span>
                  <span className="text-[14px] leading-[20px] font-bold">15%</span>
                </div>
                <div className="w-full h-1.5 bg-[#ededf9] rounded-full">
                  <div className="bg-[#004ac6] h-full w-[15%] rounded-full" />
                </div>
                <p className="text-[10px] mt-[8px] text-[#434655]">Recommended buffer to protect domain reputation.</p>
              </div>
            </div>
          </div>

          {/* Domain Reputation */}
          <div className="bg-white/80 backdrop-blur-[8px] rounded-xl p-[24px] border border-[#c3c6d7] bg-gradient-to-br from-[#004ac6]/5 to-transparent">
            <h4 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] font-bold text-[#191b23] mb-[16px]">Domain Reputation</h4>
            <div className="flex items-center gap-[24px]">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle className="text-[#ededf9]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6" />
                  <circle className="text-[#006a63]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="176" strokeDashoffset="18" strokeWidth="6" />
                </svg>
                <span className="absolute text-[12px] leading-[16px] font-bold">94</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#006a63] font-bold text-[14px] leading-[20px] font-semibold tracking-[0.05em]">Excellent</span>
                <span className="text-[12px] leading-[16px] text-[#434655]">All SPF/DKIM records verified.</span>
              </div>
            </div>
          </div>

          {/* AI Optimization Tip */}
          <div className="bg-white/80 backdrop-blur-[8px] rounded-xl p-[24px] border border-[#c3c6d7] bg-[#7d4ce7]/10 border-[#632ecd]/20">
            <div className="flex gap-[16px]">
              <Lightbulb className="size-6 text-[#632ecd] shrink-0" />
              <div className="flex flex-col gap-[4px]">
                <h5 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] font-bold text-[#23005c]">AI Optimization Tip</h5>
                <p className="text-[14px] leading-[20px] text-[#23005c] opacity-80">
                  Campaigns with &ldquo;Reply-To&rdquo; variables have 24% higher engagement. Try updating your &lsquo;Q4&rsquo; templates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
