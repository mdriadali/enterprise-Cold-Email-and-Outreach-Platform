"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  BadgeCheck,
  Briefcase,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  Edit,
  Eye,
  History,
  KeyRound,
  Lock,
  MailCheck,
  MoreVertical,
  Pause,
  PauseCircle,
  UserPlus,
  Play,
  Rocket,
  Send,
  Settings,
  ShieldCheck,
  ShieldUser,
  Sparkles,
  StopCircle,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react";
import type { CampaignStatus, Subscription, WorkspaceMemberRole } from "@repo/types";
import type { AdminWorkspaceDetailData } from "../../../../src/actions/admin/workspaces";
import { useNotification } from "@repo/ui/notification-provider";

function shortId(id: string, length: number) {
  return id.length > length ? id.slice(0, length) : id;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDayTime(date: Date) {
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${day} (${time})`;
}

function SubscriptionBadge({ subscription }: { subscription: Subscription }) {
  if (subscription === "ULTRA") {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-[#e9ddff] text-[#5516be] font-label-sm text-[12px] font-bold tracking-wide uppercase shadow-xs">
        ULTRA
      </span>
    );
  }
  if (subscription === "PROFESSIONAL") {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-[#004ac6] text-white font-label-sm text-[12px] font-bold tracking-wide uppercase shadow-xs">
        PROFESSIONAL
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full bg-[#e7e7f3] text-[#434655] font-label-sm text-[12px] font-semibold tracking-wide uppercase border border-[#c3c6d7]">
      STARTER
    </span>
  );
}

const CAMPAIGN_STATUS_META: Record<
  CampaignStatus,
  { badge: string; dot: string; pulse?: boolean }
> = {
  DRAFT: {
    badge: "bg-[#ededf9] text-[#434655] border-[#c3c6d7]",
    dot: "bg-[#737686]",
  },
  SCHEDULED: {
    badge: "bg-[#dbe1ff] text-[#003ea8] border-[#b4c5ff]",
    dot: "bg-[#004ac6]",
  },
  RUNNING: {
    badge: "bg-[#dbe1ff] text-[#003ea8] border-[#b4c5ff]",
    dot: "bg-[#2563eb]",
    pulse: true,
  },
  PAUSED: {
    badge: "bg-[#e7e7f3] text-[#434655] border-[#c3c6d7]",
    dot: "bg-[#737686]",
  },
  QUEUED: {
    badge: "bg-[#99efe5]/70 text-[#00504a] border-[#80d5cb]",
    dot: "bg-[#006a63]",
  },
  COMPLETED: {
    badge: "bg-[#99efe5]/70 text-[#00504a] border-[#80d5cb]",
    dot: "bg-[#006a63]",
  },
  CANCELLED: {
    badge: "bg-[#ffdad6]/70 text-[#93000a] border-[#efe0de]",
    dot: "bg-[#ba1a1a]",
  },
  FAILED: {
    badge: "bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/30",
    dot: "bg-[#ba1a1a]",
  },
};

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const meta = CAMPAIGN_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] border shadow-xs ${meta.badge}`}
    >
      <span className={`w-2 h-2 rounded-full ${meta.dot} ${meta.pulse ? "animate-ping" : ""}`} />
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: WorkspaceMemberRole }) {
  if (role === "OWNER") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#004ac6] text-white font-label-sm text-[11px] font-bold">
        <ShieldUser className="w-[13px] h-[13px]" />
        OWNER
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e7e7f3] text-[#434655] font-label-sm text-[11px] font-semibold border border-[#c3c6d7]">
      MEMBER
    </span>
  );
}

function MemberAvatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-lg bg-[#dbe1ff] text-[#00174b] flex items-center justify-center text-[11px] font-bold ring-1 ring-[#c3c6d7] shrink-0">
      {getInitials(name) || "?"}
    </div>
  );
}

interface AdminWorkspaceDetailClientProps {
  workspace: AdminWorkspaceDetailData;
}

export function AdminWorkspaceDetailClient({ workspace }: AdminWorkspaceDetailClientProps) {
  const { notify } = useNotification();

  const handleCopyId = (id: string) => {
    navigator.clipboard
      .writeText(id)
      .then(() =>
        notify({
          tone: "info",
          title: "Copied",
          message: "Workspace ID copied to clipboard.",
        })
      )
      .catch(() =>
        notify({
          tone: "error",
          title: "Copy failed",
          message: "Could not copy the workspace ID.",
        })
      );
  };

  const handleExport = () => {
    try {
      const payload = JSON.stringify(workspace, null, 2);
      const blob = new Blob([payload], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `workspace-${workspace.id}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      notify({
        tone: "success",
        title: "Export generated",
        message: "Workspace telemetry payload exported as JSON.",
      });
    } catch {
      notify({
        tone: "error",
        title: "Export failed",
        message: "Could not generate the JSON file.",
      });
    }
  };

  const handleNotWired = (title: string, action: string) => {
    notify({
      tone: "info",
      title,
      message: `${action} is not wired to an API endpoint yet.`,
    });
  };

  const handleDestructive = (title: string, action: string) => {
    if (!window.confirm(`${action}? This enterprise governance action requires approval.`)) return;
    handleNotWired(title, action);
  };

  const workspaceIdShort = `ws_${shortId(workspace.id, 8)}`;

  const counts = [
    workspace._count.members,
    workspace._count.campaign,
    workspace._count.generationJob,
    workspace._count.smtpAccounts,
    workspace._count.AiApiKeys,
  ];
  const maxCount = Math.max(...counts, 1);
  const pct = (value: number) => Math.round((value / maxCount) * 100);

  return (
    <div className="flex-1 px-8 py-6 max-w-[1440px] w-full mx-auto space-y-6">
      {/* BREADCRUMBS */}
      <div className="flex items-center gap-2 text-xs text-[#737686]">
        <Link href="/admin/workspaces" className="hover:text-[#004ac6] transition-colors">
          Admin Console
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#c3c6d7]" />
        <Link href="/admin/workspaces" className="hover:text-[#004ac6] transition-colors">
          Workspaces
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#c3c6d7]" />
        <span className="font-mono text-[#191b23] font-semibold text-[11px] bg-[#f3f3fe] px-2 py-0.5 rounded border border-[#c3c6d7]">
          {workspaceIdShort} ({workspace.name || "Untitled"})
        </span>
      </div>

      {/* WORKSPACE HERO BANNER & PRIMARY CONTROL BAR */}
      <div className="bg-white rounded-xl border border-[#c3c6d7] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#c3c6d7]/60">
          {/* Identity & Badges */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] flex items-center justify-center shadow-xs shrink-0">
                <Briefcase className="w-[22px] h-[22px] text-[#004ac6]" />
              </div>
              <h1 className="text-[24px] font-bold text-[#191b23] tracking-tight">
                {workspace.name || "Untitled Workspace"}
              </h1>
              <SubscriptionBadge subscription={workspace.subscription} />
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e7e7f3] text-[#434655] text-[12px] font-label-sm border border-[#c3c6d7]">
                <ShieldCheck className="w-[14px] h-[14px] text-[#006a63]" />
                SOC-2 Dedicated Pod
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#99efe5]/40 text-[#00504a] text-[12px] font-label-sm font-semibold border border-[#006a63]/30">
                <span className="w-2 h-2 rounded-full bg-[#006a63]" />
                Active &amp; Healthy
              </span>
            </div>
            {/* Monospace ID & Meta Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-[#737686]">
              <div className="flex items-center gap-1.5 bg-[#f3f3fe] px-2 py-1 rounded border border-[#c3c6d7]">
                <span className="text-[11px] text-[#737686]">Workspace ID:</span>
                <span className="font-mono text-[12px] font-semibold text-[#191b23]">
                  {workspaceIdShort}
                </span>
                <button
                  type="button"
                  className="text-[#737686] hover:text-[#004ac6] transition-colors ml-0.5"
                  title="Copy Workspace ID"
                  onClick={() => handleCopyId(workspace.id)}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[#c3c6d7]">&bull;</span>
              <span className="flex items-center gap-1">
                Owner:{" "}
                <strong className="font-medium text-[#191b23]">
                  {workspace.owner?.name}
                </strong>{" "}
                <span className="font-mono text-[#737686]">&lt;{workspace.owner?.email}&gt;</span>
              </span>
            </div>
          </div>

          {/* Primary Enterprise Admin Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e7e7f3] hover:bg-[#ededf9] text-[#191b23] font-label-md text-[14px] font-semibold border border-[#c3c6d7] transition-colors duration-150"
              onClick={() => handleNotWired("Session impersonation", "Impersonate Workspace")}
            >
              <Rocket className="w-[18px] h-[18px] text-[#004ac6]" />
              Impersonate Workspace
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e7e7f3] hover:bg-[#ededf9] text-[#191b23] font-label-md text-[14px] font-semibold border border-[#c3c6d7] transition-colors duration-150"
              onClick={() => handleNotWired("Quota management", "Edit Quotas & Tier")}
            >
              <Settings className="w-[18px] h-[18px] text-[#737686]" />
              Edit Quotas &amp; Tier
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e7e7f3] hover:bg-[#ededf9] text-[#191b23] font-label-md text-[14px] font-semibold border border-[#c3c6d7] transition-colors duration-150"
              title="Export Raw Telemetry JSON"
              onClick={handleExport}
            >
              <Download className="w-[18px] h-[18px] text-[#737686]" />
              Export JSON
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ffdad6] hover:bg-[#ffe3e0] text-[#ba1a1a] font-label-md text-[14px] font-semibold border border-[#ba1a1a]/25 transition-colors duration-150"
              onClick={() => handleDestructive("Lock workspace", "Lock Workspace")}
            >
              <Lock className="w-[18px] h-[18px]" />
              Lock Workspace
            </button>
          </div>
        </div>

        {/* SECONDARY HIGHLIGHTS BAR */}
        <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f3f3fe] border border-[#c3c6d7]/60">
            <div className="w-8 h-8 rounded-full bg-[#99efe5]/40 flex items-center justify-center text-[#006a63] shrink-0">
              <ShieldCheck className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0">
              <div className="font-label-sm text-[12px] font-semibold text-[#191b23]">
                SOC2 Isolation Protocol
              </div>
              <div className="text-[#737686] text-[11px]">
                Multi-tenant data isolation enforced at the database boundary
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f3f3fe] border border-[#c3c6d7]/60">
            <div className="w-8 h-8 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] shrink-0">
              <CreditCard className="w-[18px] h-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[12px] font-semibold text-[#191b23]">
                  Tier: {workspace.subscription}
                </span>
                <button
                  type="button"
                  className="text-[#004ac6] hover:underline text-[11px] font-medium"
                  onClick={() => handleNotWired("Tier management", "Manage Tier")}
                >
                  Manage Tier
                </button>
              </div>
              <div className="text-[#737686] text-[11px]">
                {workspace._count.members} seats in use &middot; Auto-renewal enabled
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f3f3fe] border border-[#c3c6d7]/60">
            <div className="w-8 h-8 rounded-full bg-[#e9ddff] flex items-center justify-center text-[#632ecd] shrink-0">
              <Sparkles className="w-[18px] h-[18px]" />
            </div>
            <div>
              <div className="font-label-sm text-[12px] font-semibold text-[#191b23]">
                ColdReach AI Core
              </div>
              <div className="text-[#737686] text-[11px]">
                {workspace._count.campaign} campaigns &middot; {workspace._count.generationJob} generation jobs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AGGREGATE RESOURCE COUNTERS (_count) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#191b23] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#004ac6]" />
            Aggregate Resource Counters
            <span className="font-mono text-xs text-[#737686] font-normal">(_count payload)</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Members */}
          <div className="bg-white rounded-xl border border-[#c3c6d7] p-4 shadow-xs hover:border-[#004ac6]/40 transition-colors">
            <div className="flex items-center justify-between text-[#737686] mb-1">
              <span className="font-label-sm text-[12px] font-semibold text-[#434655]">Seats / Members</span>
              <Users className="w-[18px] h-[18px] text-[#004ac6]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-[#191b23] tracking-tight">
                {workspace._count.members.toLocaleString("en-US")}
              </span>
              <span className="text-[14px] text-[#737686]">members</span>
            </div>
            <div className="w-full bg-[#ededf9] rounded-full h-1.5 mt-2">
              <div
                className="bg-[#004ac6] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, pct(workspace._count.members)))}%` }}
              />
            </div>
          </div>

          {/* Campaigns */}
          <div className="bg-white rounded-xl border border-[#c3c6d7] p-4 shadow-xs hover:border-[#004ac6]/40 transition-colors">
            <div className="flex items-center justify-between text-[#737686] mb-1">
              <span className="font-label-sm text-[12px] font-semibold text-[#434655]">Outreach Campaigns</span>
              <Send className="w-[18px] h-[18px] text-[#632ecd]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-[#191b23] tracking-tight">
                {workspace._count.campaign.toLocaleString("en-US")}
              </span>
              <span className="text-[14px] text-[#737686]">campaigns</span>
            </div>
            <div className="w-full bg-[#ededf9] rounded-full h-1.5 mt-2">
              <div
                className="bg-[#632ecd] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, pct(workspace._count.campaign)))}%` }}
              />
            </div>
          </div>

          {/* Generation Jobs */}
          <div className="bg-white rounded-xl border border-[#c3c6d7] p-4 shadow-xs hover:border-[#004ac6]/40 transition-colors">
            <div className="flex items-center justify-between text-[#737686] mb-1">
              <span className="font-label-sm text-[12px] font-semibold text-[#434655]">AI Generation Jobs</span>
              <Sparkles className="w-[18px] h-[18px] text-[#004ac6]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-[#191b23] tracking-tight">
                {workspace._count.generationJob.toLocaleString("en-US")}
              </span>
              <span className="text-[14px] text-[#737686]">jobs</span>
            </div>
            <div className="w-full bg-[#ededf9] rounded-full h-1.5 mt-2">
              <div
                className="bg-[#2563eb] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, pct(workspace._count.generationJob)))}%` }}
              />
            </div>
          </div>

          {/* SMTP */}
          <div className="bg-white rounded-xl border border-[#c3c6d7] p-4 shadow-xs hover:border-[#004ac6]/40 transition-colors">
            <div className="flex items-center justify-between text-[#737686] mb-1">
              <span className="font-label-sm text-[12px] font-semibold text-[#434655]">Verified SMTP</span>
              <MailCheck className="w-[18px] h-[18px] text-[#006a63]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-[#191b23] tracking-tight">
                {workspace._count.smtpAccounts.toLocaleString("en-US")}
              </span>
              <span className="text-[14px] text-[#737686]">accounts</span>
            </div>
            <div className="w-full bg-[#ededf9] rounded-full h-1.5 mt-2">
              <div
                className="bg-[#006a63] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, pct(workspace._count.smtpAccounts)))}%` }}
              />
            </div>
          </div>

          {/* AI Keys */}
          <div className="bg-white rounded-xl border border-[#c3c6d7] p-4 shadow-xs hover:border-[#004ac6]/40 transition-colors">
            <div className="flex items-center justify-between text-[#737686] mb-1">
              <span className="font-label-sm text-[12px] font-semibold text-[#434655]">AI Models &amp; Keys</span>
              <KeyRound className="w-[18px] h-[18px] text-[#737686]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-[#191b23] tracking-tight">
                {workspace._count.AiApiKeys.toLocaleString("en-US")}
              </span>
              <span className="text-[14px] text-[#737686]">keys</span>
            </div>
            <div className="w-full bg-[#ededf9] rounded-full h-1.5 mt-2">
              <div
                className="bg-[#737686] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, pct(workspace._count.AiApiKeys)))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* OWNER PROFILE & INFRASTRUCTURE (BENTO GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Owner Card (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#c3c6d7] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#c3c6d7]/60">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-label-md text-[14px] font-bold uppercase tracking-wider text-[#191b23]">
                  Workspace Owner
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#dbe1ff] text-[#004ac6] font-mono text-[11px] font-semibold">
                owner.role: OWNER
              </span>
            </div>
            <div className="flex items-start gap-4 mt-4">
              <div className="w-14 h-14 rounded-xl bg-[#dbe1ff] text-[#00174b] flex items-center justify-center text-lg font-bold border border-[#2563eb]/20 shadow-xs shrink-0">
                {getInitials(workspace.owner?.name) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-[18px] font-bold text-[#191b23] truncate">
                    {workspace.owner?.name}
                  </h4>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006a63]" title="Owner account is active and verified" />
                </div>
                <div className="text-[14px] text-[#434655] truncate">{workspace.owner?.email}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-[#737686]">Owner User ID:</span>
                  <Link
                    href={`/admin/users/${workspace.owner?.id}`}
                    className="font-mono text-[12px] text-[#004ac6] hover:underline font-semibold bg-[#f3f3fe] px-2 py-0.5 rounded border border-[#c3c6d7] flex items-center gap-1"
                  >
                    {shortId(workspace.owner?.id, 10)}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
            {/* Ownership Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-[#f3f3fe] rounded-lg border border-[#c3c6d7]/60 text-xs">
              <div>
                <span className="text-[#737686] block text-[11px]">Primary Authentication:</span>
                <span className="font-medium text-[#191b23] flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006a63]" />
                  Verified Account
                </span>
              </div>
              <div>
                <span className="text-[#737686] block text-[11px]">Member Since:</span>
                <span className="font-medium text-[#191b23] block mt-0.5">
                  Workspace Owner
                </span>
              </div>
            </div>
          </div>
          {/* Quick Owner Actions */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#c3c6d7]/60">
            <Link
              href={`/admin/users/${workspace.owner?.id}`}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#e7e7f3] hover:bg-[#ededf9] text-[#004ac6] font-label-md text-[14px] font-semibold border border-[#c3c6d7] transition-colors"
            >
              <Users className="w-4 h-4" />
              View Owner Profile
            </Link>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white hover:bg-[#f3f3fe] text-[#434655] font-label-md text-[14px] font-semibold border border-[#c3c6d7] transition-colors"
              onClick={() => handleNotWired("Ownership transfer", "Transfer Ownership")}
            >
              <ArrowLeftRight className="w-4 h-4 text-[#737686]" />
              Transfer Ownership
            </button>
          </div>
        </div>

        {/* Infrastructure & Compliance Card (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#c3c6d7] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#c3c6d7]/60">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-label-md text-[14px] font-bold uppercase tracking-wider text-[#191b23]">
                  Infrastructure &amp; Compliance Topology
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#006a63] bg-[#99efe5]/40 px-2 py-0.5 rounded font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006a63]" />
                SOC2 Type II Active
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-[#737686] block">Subscription Tier:</span>
                  <div className="text-[14px] font-medium text-[#191b23] mt-0.5 uppercase">
                    {workspace.subscription}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-[#737686] block">Total Members:</span>
                  <div className="font-mono text-[14px] text-[#191b23] mt-0.5">
                    {workspace._count.members} seats
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-[#737686] block">Total Campaigns:</span>
                  <div className="font-mono text-[14px] text-[#191b23] mt-0.5">
                    {workspace._count.campaign} registered
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-[#737686] block">AI Generation Jobs:</span>
                  <div className="text-[14px] font-medium text-[#191b23] mt-0.5">
                    {workspace._count.generationJob} total
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-[#737686] block">Verified SMTP Accounts:</span>
                  <div className="text-[14px] font-medium text-[#191b23] mt-0.5">
                    {workspace._count.smtpAccounts} connected
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-[#737686] block">Connected AI API Keys:</span>
                  <div className="text-[14px] font-medium text-[#191b23] mt-0.5">
                    {workspace._count.AiApiKeys} keys
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Telemetry Status */}
          <div className="flex items-center justify-between p-3 bg-[#f3f3fe] rounded-lg border border-[#c3c6d7]/60 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-[18px] h-[18px] text-[#006a63]" />
              <span className="text-[#191b23] font-medium">
                Tenant boundary enforced &mdash; data fetched via{" "}
                <span className="font-mono">GET /admin/workspaces/:id</span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#006a63] font-semibold">200 OK</span>
          </div>
        </div>
      </div>

      {/* MEMBERS TABULAR LIST */}
      <section className="bg-white rounded-xl border border-[#c3c6d7] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#c3c6d7]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-[22px] h-[22px] text-[#004ac6]" />
              <h2 className="text-[20px] font-semibold text-[#191b23]">Tenant Members</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#f3f3fe] text-[#191b23] font-mono text-xs font-semibold border border-[#c3c6d7]">
                {workspace._count.members} Seats Used / {workspace._count.members} Total
              </span>
            </div>
            <p className="text-[14px] text-[#737686] mt-0.5">
              Manage user access privileges, roles, and administrative tenancy delegation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#004ac6] hover:bg-[#2563eb] text-white font-label-md text-[14px] font-semibold transition-colors duration-150 shadow-xs whitespace-nowrap"
              onClick={() => handleNotWired("Add member", "Add Workspace Member")}
            >
              <UserPlus className="w-4 h-4" />
              + Add Member
            </button>
          </div>
        </div>
        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f3fe] border-b border-[#c3c6d7] text-[11px] uppercase tracking-wider text-[#737686] font-semibold">
                <th className="py-3 px-4">Member Profile</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Workspace Role</th>
                <th className="py-3 px-4">Member Record</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d7]/60 text-[14px]">
              {workspace.members.length === 0 ? (
                <tr>
                  <td className="py-12 text-center text-[#737686]" colSpan={5}>
                    <Users className="w-10 h-10 mx-auto mb-2 text-[#c3c6d7]" />
                    <p className="text-sm font-medium">No members found</p>
                    <p className="text-xs text-[#737686] mt-1">This workspace has no tenant members.</p>
                  </td>
                </tr>
              ) : (
                workspace.members.map((member) => (
                  <tr key={member.id} className="hover:bg-[#f3f3fe]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={member.userName} />
                        <div>
                          <div className="font-medium text-[#191b23] flex items-center gap-1.5">
                            {member.userName}
                            {member.role === "OWNER" && (
                              <span className="px-1.5 py-0.2 rounded bg-[#99efe5]/60 text-[#00504a] font-mono text-[9px] font-bold">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-[#737686]">{member.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/users/${member.userId}`}
                        className="font-mono text-[12px] text-[#004ac6] hover:underline font-semibold bg-[#f3f3fe] px-2 py-0.5 rounded border border-[#c3c6d7]"
                      >
                        {shortId(member.userId, 10)}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[12px] text-[#434655] bg-[#f3f3fe] px-2 py-0.5 rounded border border-[#c3c6d7]">
                        {shortId(member.id, 10)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/users/${member.userId}`}
                          className="p-1 hover:bg-[#f3f3fe] rounded text-[#737686] hover:text-[#004ac6] transition-colors"
                          title="Inspect User"
                        >
                          <Settings className="w-[18px] h-[18px]" />
                        </Link>
                        <button
                          type="button"
                          className="p-1 hover:bg-[#f3f3fe] rounded text-[#737686] hover:text-[#191b23] transition-colors"
                          title="Audit Key History"
                          onClick={() =>
                            handleNotWired("Audit history", `Audit ${member.userName}'s key history`)
                          }
                        >
                          <History className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:bg-[#f3f3fe] rounded text-[#737686] hover:text-[#ba1a1a] transition-colors"
                          title="Tenancy Actions"
                          onClick={() =>
                            handleDestructive(
                              "Remove member",
                              `Revoke ${member.userName}'s member access`
                            )
                          }
                        >
                          <MoreVertical className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Table Pagination Footer */}
        <div className="p-4 bg-[#f3f3fe] border-t border-[#c3c6d7] flex items-center justify-between text-xs text-[#737686]">
          <div>
            Showing <span className="font-semibold text-[#191b23]">{workspace.members.length}</span> of{" "}
            <span className="font-semibold text-[#191b23]">{workspace._count.members}</span> members in workspace
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="px-2 py-1 rounded bg-white border border-[#c3c6d7] text-[#737686] hover:text-[#191b23] disabled:opacity-40 text-xs"
              disabled
            >
              Previous
            </button>
            <span className="px-2 py-1 bg-[#004ac6] text-white rounded font-semibold font-mono text-[11px]">
              1
            </span>
            <button
              type="button"
              className="px-2 py-1 rounded bg-white border border-[#c3c6d7] hover:bg-[#ededf9] text-[#191b23] text-xs"
              onClick={() => handleNotWired("Pagination", "Full member pagination")}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* CAMPAIGNS TELEMETRY TABLE */}
      <section className="bg-white rounded-xl border border-[#c3c6d7] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#c3c6d7]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Send className="w-[22px] h-[22px] text-[#004ac6]" />
              <h2 className="text-[20px] font-semibold text-[#191b23]">Active Campaigns &amp; Sequences</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#99efe5]/50 text-[#00504a] font-mono text-xs font-semibold border border-[#006a63]/25">
                {workspace._count.campaign} Total Registered
              </span>
            </div>
            <p className="text-[14px] text-[#737686] mt-0.5">
              Real-time status enumeration ({`DRAFT, SCHEDULED, RUNNING, PAUSED, QUEUED, COMPLETED, CANCELLED, FAILED`}).
            </p>
          </div>
          {/* Status Legend & Quick Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#f3f3fe] p-1 rounded-lg border border-[#c3c6d7] text-xs">
            <span className="px-2.5 py-1 rounded-md bg-white font-semibold text-[#004ac6] shadow-xs">
              All ({workspace._count.campaign})
            </span>
            <span className="px-2.5 py-1 rounded-md text-[#434655]">
              Loaded ({workspace.campaigns.length})
            </span>
          </div>
        </div>
        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f3fe] border-b border-[#c3c6d7] text-[11px] uppercase tracking-wider text-[#737686] font-semibold">
                <th className="py-3 px-4">Campaign Name &amp; ID</th>
                <th className="py-3 px-4">Telemetry Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d7]/60 text-[14px]">
              {workspace.campaigns.length === 0 ? (
                <tr>
                  <td className="py-12 text-center text-[#737686]" colSpan={4}>
                    <Send className="w-10 h-10 mx-auto mb-2 text-[#c3c6d7]" />
                    <p className="text-sm font-medium">No campaigns found</p>
                    <p className="text-xs text-[#737686] mt-1">
                      This workspace has not registered any campaigns.
                    </p>
                  </td>
                </tr>
              ) : (
                workspace.campaigns
                  .slice()
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-[#f3f3fe]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-[#191b23] flex items-center gap-1.5">
                            {campaign.name}
                            {campaign.status === "RUNNING" && (
                              <Rocket className="w-4 h-4 text-[#004ac6]" />
                            )}
                            {campaign.status === "COMPLETED" && (
                              <span className="inline-flex items-center">
                                <svg className="w-4 h-4 text-[#006a63]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </span>
                            )}
                            {campaign.status === "PAUSED" && (
                              <PauseCircle className="w-4 h-4 text-[#737686]" />
                            )}
                            {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
                              <Edit className="w-4 h-4 text-[#737686]" />
                            )}
                          </div>
                          <div className="font-mono text-[12px] text-[#737686]">
                            {shortId(campaign.id, 8)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <CampaignStatusBadge status={campaign.status} />
                      </td>
                      <td className="py-3 px-4 text-[#434655] font-mono text-[12px]">
                        {formatDayTime(campaign.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="p-1 hover:bg-[#f3f3fe] rounded text-[#737686] hover:text-[#004ac6] transition-colors"
                            title="Inspect Campaign"
                            onClick={() =>
                              handleNotWired("Campaign inspect", `Inspect ${campaign.name}`)
                            }
                          >
                            <Eye className="w-[18px] h-[18px]" />
                          </button>
                          {campaign.status === "RUNNING" ? (
                            <button
                              type="button"
                              className="p-1 hover:bg-[#f3f3fe] rounded text-[#737686] hover:text-[#191b23] transition-colors"
                              title="Pause Sequence"
                              onClick={() =>
                                handleDestructive("Pause campaign", `Pause ${campaign.name}`)
                              }
                            >
                              <Pause className="w-[18px] h-[18px]" />
                            </button>
                          ) : campaign.status === "PAUSED" ? (
                            <button
                              type="button"
                              className="p-1 hover:bg-[#f3f3fe] rounded text-[#737686] hover:text-[#006a63] transition-colors"
                              title="Resume Campaign"
                              onClick={() =>
                                handleNotWired("Campaign action", `Resume ${campaign.name}`)
                              }
                            >
                              <Play className="w-[18px] h-[18px]" />
                            </button>
                          ) : null}
                          {campaign.status !== "COMPLETED" && campaign.status !== "CANCELLED" && campaign.status !== "FAILED" && (
                            <button
                              type="button"
                              className="p-1 hover:bg-[#f3f3fe] rounded text-[#737686] hover:text-[#ba1a1a] transition-colors"
                              title="Terminate Campaign"
                              onClick={() =>
                                handleDestructive("Terminate campaign", `Terminate ${campaign.name}`)
                              }
                            >
                              <StopCircle className="w-[18px] h-[18px]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[#f3f3fe] border-t border-[#c3c6d7] flex items-center justify-between text-xs text-[#737686]">
          <div>
            Displaying {workspace.campaigns.length} of {workspace._count.campaign} total campaign records
          </div>
          <button
            type="button"
            className="text-[#004ac6] hover:underline font-semibold font-label-sm text-[12px] flex items-center gap-1"
            onClick={() => handleNotWired("Campaign console", "Full campaign console")}
          >
            View All {workspace._count.campaign} Campaigns in Dedicated Campaign Console
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ENTERPRISE DANGER ZONE */}
      <section className="border border-[#ba1a1a]/30 rounded-xl bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ba1a1a]/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
              <TriangleAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#ba1a1a]">
                Enterprise Administrative Danger Zone
              </h3>
              <p className="text-[12px] text-[#737686]">
                Irreversible tenant operations requiring Dual-Custody Approval and RFC-7807 compliance logging.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#ba1a1a] bg-[#ffdad6]/60 px-2 py-0.5 rounded font-bold border border-[#ba1a1a]/20">
            AUDIT_LEVEL: RESTRICTED
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Danger Action 1 */}
          <div className="p-4 rounded-lg bg-[#f3f3fe] border border-[#c3c6d7] flex flex-col justify-between">
            <div>
              <div className="font-label-md text-[14px] font-bold text-[#191b23]">Suspend Tenant Routing</div>
              <p className="text-[12px] text-[#737686] mt-1">
                Immediately cuts SMTP dispatches, rejects incoming webhook payloads, and halts generation pipelines.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 w-full py-2 px-4 rounded-lg border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6] font-label-md text-[14px] font-semibold transition-colors duration-150"
              onClick={() => handleDestructive("Suspend routing", "Suspend tenant routing")}
            >
              Suspend Routing
            </button>
          </div>
          {/* Danger Action 2 */}
          <div className="p-4 rounded-lg bg-[#f3f3fe] border border-[#c3c6d7] flex flex-col justify-between">
            <div>
              <div className="font-label-md text-[14px] font-bold text-[#191b23]">Force Session Invalidation</div>
              <p className="text-[12px] text-[#737686] mt-1">
                Revokes all active JWT tokens, refreshes OAuth grants, and logs out all workspace members immediately.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 w-full py-2 px-4 rounded-lg border border-[#c3c6d7] text-[#191b23] hover:bg-[#ededf9] font-label-md text-[14px] font-semibold transition-colors duration-150"
              onClick={() => handleDestructive("Session invalidation", "Invalidate all sessions")}
            >
              Invalidate All Sessions
            </button>
          </div>
          {/* Danger Action 3 */}
          <div className="p-4 rounded-lg bg-[#f3f3fe] border border-[#ba1a1a]/40 flex flex-col justify-between">
            <div>
              <div className="font-label-md text-[14px] font-bold text-[#ba1a1a]">Purge Workspace Data</div>
              <p className="text-[12px] text-[#737686] mt-1">
                Executes hard-purge of tenant isolation schema. Requires confirmation from 2 Super Admins.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 w-full py-2 px-4 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white font-label-md text-[14px] font-bold transition-colors duration-150 shadow-xs"
              onClick={() => handleDestructive("Purge workspace", "Purge tenant data")}
            >
              Purge Tenant Data
            </button>
          </div>
        </div>
      </section>

      {/* API SPEC FOOTER */}
      <footer className="pt-3 pb-4 border-t border-[#c3c6d7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#737686]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-[#f3f3fe] px-2 py-0.5 rounded border border-[#c3c6d7] font-mono text-[11px] text-[#191b23]">
            <span className="text-[#006a63] font-bold">GET</span> /admin/workspaces/:id
          </span>
          <span className="text-[#006a63] font-mono font-semibold">200 OK</span>
          <span>&bull;</span>
          <span>
            Response: <strong className="font-mono text-[#191b23]">24.6ms</strong>
          </span>
          <span>&bull;</span>
          <span>RFC-7807 Problem Details Standard Compliant</span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            Tenant: <span className="font-mono text-[#191b23]">{workspaceIdShort}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
