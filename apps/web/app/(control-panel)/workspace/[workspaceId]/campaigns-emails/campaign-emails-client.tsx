"use client";

import Link from "next/link";
import {
  BarChart3,
  CheckCircle,
  Grid3X3,
  List,
  Mail,
  MoreVertical,
  Sparkles,
  Timer,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { CampaignInfo } from "../../../../src/actions/workspace/workspace-info";

type Props = {
  workspaceId: string;
  campaigns: CampaignInfo[];
};

const statusStyles: Record<string, { badge: string; dot: string }> = {
  DRAFT: { badge: "bg-[#e9ddff] text-[#5516be]", dot: "bg-[#632ecd]" },
  SCHEDULED: { badge: "bg-[#dbe1ff] text-[#003ea8]", dot: "bg-[#004ac6]" },
  RUNNING: { badge: "bg-[#99efe5] text-[#00504a]", dot: "bg-[#006a63]" },
  PAUSED: { badge: "bg-[#e1e2ed] text-[#434655]", dot: "bg-[#737686]" },
  QUEUED: { badge: "bg-[#dbe1ff] text-[#003ea8]", dot: "bg-[#004ac6]" },
  PROCESSING: { badge: "bg-[#dbe1ff] text-[#003ea8]", dot: "bg-[#004ac6]" },
  COMPLETED: { badge: "bg-[#99efe5] text-[#00504a]", dot: "bg-[#006a63]" },
  FAILED: { badge: "bg-[#ffdad6] text-[#93000a]", dot: "bg-[#ba1a1a]" },
  CANCELLED: { badge: "bg-[#e1e2ed] text-[#434655]", dot: "bg-[#737686]" },
  PENDING: { badge: "bg-[#e1e2ed] text-[#434655]", dot: "bg-[#737686]" },
};

export function CampaignEmailsHomeClient({ workspaceId, campaigns }: Props) {
  const activeCount = campaigns.filter((c) => c.status === "RUNNING").length;

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#faf8ff]">
      <div className="p-[32px] space-y-[32px] max-w-[1440px] mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px]">
          <div className="space-y-[8px]">
            <h2 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">
              Select Campaign
            </h2>
            <p className="text-[18px] leading-[28px] text-[#434655]">
              Email Management &amp; Performance Dashboard
            </p>
          </div>
          <div className="flex items-center gap-[8px]">
            <div className="flex bg-[#f3f3fe] p-[4px] rounded-lg">
              <button className="px-[16px] py-[8px] bg-white text-[#004ac6] shadow-sm rounded-md text-[14px] leading-[20px] font-semibold tracking-[0.05em] flex items-center gap-[8px]">
                <Grid3X3 className="size-[20px]" />
                Grid
              </button>
              <button className="px-[16px] py-[8px] text-[#434655] hover:bg-[#e1e2ed] rounded-md text-[14px] leading-[20px] font-semibold tracking-[0.05em] flex items-center gap-[8px] transition-colors">
                <List className="size-[20px]" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          <div className="bg-[#f3f3fe] p-[24px] rounded-xl border border-[#c3c6d7] flex items-start justify-between">
            <div>
              <p className="text-[12px] leading-[16px] font-medium text-[#434655] uppercase tracking-wider">
                Total Active
              </p>
              <h4 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mt-[8px]">
                {activeCount}
              </h4>
            </div>
            <CheckCircle className="size-[24px] text-[#004ac6]" />
          </div>
          <div className="bg-[#f3f3fe] p-[24px] rounded-xl border border-[#c3c6d7] flex items-start justify-between">
            <div>
              <p className="text-[12px] leading-[16px] font-medium text-[#434655] uppercase tracking-wider">
                Avg. Open Rate
              </p>
              <h4 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mt-[8px]">
                42.8%
              </h4>
            </div>
            <TrendingUp className="size-[24px] text-[#006a63]" />
          </div>
          <div className="bg-[#f3f3fe] p-[24px] rounded-xl border border-[#c3c6d7] flex items-start justify-between">
            <div>
              <p className="text-[12px] leading-[16px] font-medium text-[#434655] uppercase tracking-wider">
                Unseen Replies
              </p>
              <h4 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mt-[8px]">
                24
              </h4>
            </div>
            <Mail className="size-[24px] text-[#632ecd]" />
          </div>
          <div className="bg-[#f3f3fe] p-[24px] rounded-xl border border-[#c3c6d7] flex items-start justify-between">
            <div>
              <p className="text-[12px] leading-[16px] font-medium text-[#434655] uppercase tracking-wider">
                Credits Remaining
              </p>
              <h4 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mt-[8px]">
                1.2k
              </h4>
            </div>
            <Wallet className="size-[24px] text-[#737686]" />
          </div>
        </div>

        {/* Campaign Bento Grid */}
        {campaigns.length === 0 ? (
          <div className="text-center py-[48px] text-[#737686]">
            No campaigns found.
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-[24px]">
            {campaigns.map((c) => {
              const s = (statusStyles[c.status] ?? statusStyles.PENDING)!;
              return (
                <CampaignCard
                  key={c.id}
                  c={c}
                  s={s}
                  workspaceId={workspaceId}
                />
              );
            })}

            {/* Featured Analytics Card */}
            <div className="col-span-12 lg:col-span-8 bg-white/80 backdrop-blur-[8px] border border-[#c3c6d7] rounded-xl p-[24px] flex flex-col md:flex-row gap-[24px] hover:translate-y-[-4px] hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)] hover:border-[#004ac6] transition-all duration-300">
              <div className="flex-1">
                <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mb-[8px]">
                  Campaign Performance Overlap
                </h3>
                <p className="text-[14px] leading-[20px] text-[#434655] mb-[24px]">
                  Comparing reply rates across all active campaigns over the
                  last 30 days.
                </p>
                <div className="h-[192px] w-full bg-[#f3f3fe] rounded-lg overflow-hidden relative group">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 backdrop-blur px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] text-[12px] leading-[16px] font-semibold tracking-[0.05em] shadow-lg">
                      Processing Global Trend Analysis...
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:w-[256px] space-y-[16px]">
                <div className="bg-[#f3f3fe] p-[16px] rounded-lg border border-[#c3c6d7]">
                  <p className="text-[12px] leading-[16px] font-medium text-[#434655]">
                    Top Performer
                  </p>
                  <p className="text-[16px] leading-[24px] font-bold text-[#004ac6]">
                    {campaigns[0]?.name ?? "—"}
                  </p>
                  <div className="mt-[8px] flex items-center gap-[8px]">
                    <TrendingUp className="size-[14px] text-[#006a63]" />
                    <span className="text-[12px] leading-[16px] font-semibold text-[#006a63]">
                      +12.4%
                    </span>
                  </div>
                </div>
                <div className="bg-[#f3f3fe] p-[16px] rounded-lg border border-[#c3c6d7]">
                  <p className="text-[12px] leading-[16px] font-medium text-[#434655]">
                    Response Latency
                  </p>
                  <p className="text-[16px] leading-[24px] font-bold text-[#191b23]">
                    2.4 hours
                  </p>
                  <div className="mt-[8px] flex items-center gap-[8px]">
                    <Timer className="size-[14px] text-[#737686]" />
                    <span className="text-[12px] leading-[16px] font-medium text-[#737686]">
                      Optimal range
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Campaign Suggestion Card */}
            <div className="col-span-12 lg:col-span-4 bg-[#004ac6] p-[24px] rounded-xl text-white flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-10%] opacity-20 rotate-12">
                <Sparkles className="size-[160px]" />
              </div>
              <div>
                <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] mb-[8px]">
                  AI Campaign Suggestion
                </h3>
                <p className="text-[14px] leading-[20px] opacity-90 mb-[24px]">
                  Based on your recent lead imports, a &quot;SaaS Mid-Market&quot;
                  campaign would likely see a 15% higher conversion rate.
                </p>
              </div>
              <button className="bg-white text-[#004ac6] w-full py-[8px] rounded-lg text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:bg-[#f3f3fe] transition-all relative z-10">
                Generate Sequence
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignCard({
  c,
  s,
  workspaceId,
}: {
  c: CampaignInfo;
  s: { badge: string; dot: string };
  workspaceId: string;
}) {
  return (
    <div className="col-span-12 lg:col-span-6 xl:col-span-4 bg-white/80 backdrop-blur-[8px] border border-[#c3c6d7] rounded-xl p-[24px] flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)] hover:border-[#004ac6] transition-all duration-300">
      <div>
        <div className="flex justify-between items-start mb-[16px]">
          <span
            className={`${s.badge} px-[12px] py-[4px] rounded-full text-[12px] leading-[16px] font-semibold tracking-[0.05em] flex items-center gap-[4px]`}
          >
            <span className={`w-[6px] h-[6px] rounded-full ${s.dot}`} />
            {c.status === "RUNNING" || c.status === "PROCESSING" ? (
              <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse" />
            ) : null}
            {c.status}
          </span>
          <button className="text-[#737686] hover:text-[#004ac6] transition-colors">
            <MoreVertical className="size-[24px]" />
          </button>
        </div>
        <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mb-[8px]">
          {c.name}
        </h3>
        <p className="text-[14px] leading-[20px] text-[#434655] mb-[24px] line-clamp-2">
          {c.description ?? "No description provided."}
        </p>
        <div className="flex items-center gap-[48px] mb-[24px]">
          <div>
            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#737686]">
              TOTAL LEADS
            </p>
            <p className="text-[18px] leading-[28px] font-bold text-[#191b23]">
              —
            </p>
          </div>
          <div>
            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#737686]">
              DELIVERED
            </p>
            <p className="text-[18px] leading-[28px] font-bold text-[#191b23]">
              —
            </p>
          </div>
        </div>
      </div>
      <div className="pt-[16px] border-t border-[#c3c6d7] flex gap-[8px]">
        <Link
          href={`/workspace/${workspaceId}/campaigns/${c.id}/emails`}
          className="flex-1 bg-[#004ac6] text-white py-[8px] rounded-lg text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:opacity-90 transition-all text-center"
        >
          View Emails
        </Link>
        <button className="w-[48px] h-[40px] border border-[#c3c6d7] flex items-center justify-center rounded-lg hover:bg-[#f3f3fe] transition-all">
          <BarChart3 className="size-[20px] text-[#434655]" />
        </button>
      </div>
    </div>
  );
}
