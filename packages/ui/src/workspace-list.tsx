"use client";

import { Hexagon, PlusCircle, Home, Rocket, UsersRound } from "lucide-react";

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
      <div className="border-2 border-dashed border-[#c3c6d7] rounded-xl p-12 flex flex-col items-center justify-center text-center gap-4 hover:bg-[#f3f3fe] transition-colors group cursor-pointer min-h-[224px]">
        <div className="size-16 rounded-full bg-[#e1e2ed] flex items-center justify-center text-[#434655] group-hover:scale-110 transition-transform">
          <Home className="size-8" />
        </div>
        <div>
          <p className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#191b23]">Collaborate on a new project?</p>
          <p className="text-xs leading-4 text-[#434655]">Create a separate workspace to isolate campaigns and teams.</p>
        </div>
      </div>
    </div>
  );
}

function WorkspaceCard({ workspace, index }: { workspace: WorkspaceData; index: number }) {
  const Icon = workspaceIcons[index % workspaceIcons.length]!;
  const colors = workspaceColors[index % workspaceColors.length]!;
  const workspaceName = workspace.name || `Workspace ${workspace.workspaceId.slice(0, 8)}`;
  const campaigns = workspace.activeCampaigns ?? 0;
  const leads = workspace.totalLeads ?? 0;

  return (
    <div className="group bg-white border border-[#c3c6d7] rounded-xl p-6 flex items-center justify-between hover:border-[#004ac6] hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className={`size-12 shrink-0 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text}`}>
          <Icon className="size-7" strokeWidth={1.5} fill="currentColor" />
        </div>
        <div>
          <h4 className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#191b23] group-hover:text-[#004ac6] transition-colors">{workspaceName}</h4>
          <p className="text-xs leading-4 text-[#434655]">{campaigns} Active Campaign{campaigns !== 1 ? "s" : ""} &bull; {leads.toLocaleString()} Lead{leads !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-xs leading-4 font-medium px-4 py-1 bg-[#e7e7f3] rounded-full text-[#434655]">{workspace.role === "OWNER" ? "Owner" : "Member"}</span>
        <a href={`/workspace/${workspace.workspaceId}`} className="px-6 py-2 bg-[#2563eb] text-[#eeefff] text-sm leading-5 font-semibold tracking-[0.05em] rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">
          Manage
        </a>
      </div>
    </div>
  );
}
