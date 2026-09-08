"use client";
import Link from "next/link";
import { ArrowUpRight, Hexagon, Home, Rocket, UsersRound } from "lucide-react";

export type WorkspaceData = {
  id: string;
  workspaceId: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  createdAt: string;
  name?: string;
  activeCampaigns?: number;
  totalLeads?: number;
};

export type WorkspaceListProps = {
  workspaces: WorkspaceData[];
};

const workspaceIcons = [Hexagon, Rocket, UsersRound];
const workspaceColors = [
  { bg: "bg-[#dbe1ff]", text: "text-[#004ac6]" },
  { bg: "bg-[#9cf2e8]", text: "text-[#006f67]" },
  { bg: "bg-[#e9ddff]", text: "text-[#5516be]" },
];

export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  return (
    <div className="space-y-4">
      {workspaces.map((workspace, i) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} index={i} />
      ))}
      <Link
        href="/workspaces/new"
        className="border-2 border-dashed border-[#c3c6d7] rounded-xl p-12 flex flex-col items-center justify-center text-center gap-4 hover:bg-[#f3f3fe] transition-colors group cursor-pointer min-h-[224px]"
      >
        <div className="size-16 rounded-full bg-[#e1e2ed] flex items-center justify-center text-[#434655] group-hover:scale-110 transition-transform">
          <Home className="size-8" />
        </div>
        <div>
          <p className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#191b23]">Collaborate on a new project?</p>
          <p className="text-xs leading-4 text-[#434655]">Create a separate workspace to isolate campaigns and teams.</p>
        </div>
      </Link>
    </div>
  );
}

function WorkspaceCard({ workspace, index }: { workspace: WorkspaceData; index: number }) {
  const Icon = workspaceIcons[index % workspaceIcons.length]!;
  const colors = workspaceColors[index % workspaceColors.length]!;
  const workspaceName = workspace.name || `Workspace ${workspace.workspaceId.slice(0, 8)}`;
  const campaigns = workspace.activeCampaigns ?? 0;
  const leads = workspace.totalLeads ?? 0;
  const isOwner = workspace.role === "OWNER";

  return (
    <div className="group relative overflow-hidden bg-white border border-[#c3c6d7] rounded-2xl p-6 flex items-center justify-between gap-6 hover:border-[#004ac6] hover:shadow-lg hover:shadow-[#004ac6]/5 transition-all duration-300">
      <div className={`absolute inset-y-0 left-0 w-1 ${colors.bg}`} />
      <div className="flex items-center gap-5 min-w-0">
        <div className={`relative size-14 shrink-0 ${colors.bg} rounded-2xl flex items-center justify-center ${colors.text}`}>
          <Icon className="size-8" strokeWidth={1.5} fill="currentColor" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-base leading-6 font-semibold tracking-[0.01em] text-[#191b23] group-hover:text-[#004ac6] transition-colors truncate">{workspaceName}</h4>
            <span className={`shrink-0 text-[10px] leading-4 font-semibold tracking-[0.06em] uppercase px-2 py-0.5 rounded-full ${isOwner ? "bg-[#e0f5f2] text-[#006a63]" : "bg-[#e7e7f3] text-[#434655]"}`}>
              {isOwner ? "Owner" : "Member"}
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] leading-4 text-[#8a8da0] truncate">ID: {workspace.workspaceId}</p>
          <div className="mt-2.5 flex items-center gap-4">
            <Stat label="Active" value={`${campaigns}`} suffix={campaigns !== 1 ? "Campaigns" : "Campaign"} />
            <span className="text-[#c3c6d7]">|</span>
            <Stat label="Leads" value={`${leads.toLocaleString()}`} />
          </div>
        </div>
      </div>
      <Link
        href={`/workspace/${workspace.workspaceId}`}
        className="shrink-0 inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#2563eb] text-[#eeefff] text-sm leading-5 font-semibold tracking-[0.05em] rounded-xl shadow-sm hover:shadow-md hover:bg-[#1d4ed8] transition-all active:scale-95"
      >
        Manage
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[#191b23] text-sm font-bold">{value}</span>
      <span className="text-xs leading-4 text-[#6a6d80]">{suffix ?? label}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
