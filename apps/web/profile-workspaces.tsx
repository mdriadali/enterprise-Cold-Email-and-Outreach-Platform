"use client";

import Link from "next/link";
import { Edit, Plus, Sparkles, Rocket, Building2, Home, CheckCircle } from "lucide-react";

export type ProfileWorkspace = {
  id: string;
  workspaceId: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  createdAt: string;
  name?: string;
  activeCampaigns?: number;
  totalLeads?: number;
};

export type ProfileWorkspacesProps = {
  name: string;
  email: string;
  role: string;
  workspaces: ProfileWorkspace[];
};

const workspaceIcons = [Sparkles, Rocket, Building2];
const workspaceColors = [
  { bg: "bg-[#dbe1ff]", text: "text-[#004ac6]" },
  { bg: "bg-[#9cf2e8]", text: "text-[#006f67]" },
  { bg: "bg-[#e9ddff]", text: "text-[#5516be]" }
];

/** Pixel-perfect profile and workspace view matching the provided HTML design. */
export function ProfileWorkspaces({ name, email, role, workspaces }: Readonly<ProfileWorkspacesProps>) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "U";

  return (
    <main className="p-6 md:p-8 bg-[#faf8ff] min-h-screen">
      <div className="max-w-[1000px] mx-auto">
        {/* Profile Header */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                <div className="w-full h-full bg-gradient-to-br from-[#dbe1ff] to-[#9cf2e8] flex items-center justify-center text-4xl font-bold text-[#004ac6] group-hover:scale-105 transition-transform duration-500">
                  {initial}
                </div>
              </div>
              <button 
                className="absolute -bottom-2 -right-2 bg-[#004ac6] text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                type="button"
                aria-label="Edit profile image"
              >
                <Edit className="w-[18px] h-[18px]" />
              </button>
            </div>
            <div className="pb-2">
              <h2 className="text-4xl md:text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23] mb-1">
                {name}
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <span className="px-2 py-1 bg-[#dbe1ff] text-[#003ea8] text-xs leading-4 font-medium rounded uppercase tracking-wider">
                  {role}
                </span>
                <span className="text-[#434655] text-base leading-6">{email}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Layout for Settings & Workspaces */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Personal Information Section (Left Column) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl leading-8 font-semibold tracking-[-0.01em] text-[#191b23]">
                  Personal Info
                </h3>
                <button 
                  className="text-[#004ac6] text-sm leading-5 font-semibold tracking-[0.05em] hover:underline"
                  type="button"
                >
                  Edit Info
                </button>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#434655]">
                    Full Name
                  </label>
                  <div className="w-full px-4 py-2 bg-[#f3f3fe] border border-[#c3c6d7] rounded-lg text-[#191b23] text-base leading-6 min-h-[40px] flex items-center">
                    {name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#434655]">
                    Email Address
                  </label>
                  <div className="w-full px-4 py-2 bg-[#f3f3fe] border border-[#c3c6d7] rounded-lg text-[#191b23] text-base leading-6 flex items-center justify-between min-h-[40px]">
                    <span>{email}</span>
                    <CheckCircle className="w-[18px] h-[18px] text-[#006a63] fill-[#006a63]" aria-label="Verified email" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workspaces Management (Right Column) */}
          <div className="lg:col-span-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <h3 className="text-2xl leading-8 font-semibold tracking-[-0.01em] text-[#191b23]">
                Your Workspaces
              </h3>
              <button 
                className="flex items-center gap-1 self-start text-sm leading-5 font-semibold tracking-[0.05em] text-[#004ac6] hover:bg-[#dbe1ff] px-4 py-2 rounded-lg transition-all active:scale-95"
                type="button"
              >
                <Plus className="w-5 h-5" />
                Create New Workspace
              </button>
            </div>
            <div className="space-y-4">
              {/* Workspace Cards */}
              {workspaces.map((workspace, index) => {
                const Icon = workspaceIcons[index % workspaceIcons.length]!;
                const colors = workspaceColors[index % workspaceColors.length]!;
                const workspaceName = workspace.name || `Workspace ${workspace.workspaceId.slice(0, 8)}`;
                const campaigns = workspace.activeCampaigns ?? 0;
                const leads = workspace.totalLeads ?? 0;
                
                return (
                  <article 
                    key={workspace.id}
                    className="group bg-white border border-[#c3c6d7] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-[#004ac6] hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-6 min-w-0 flex-1">
                      <div className={`w-12 h-12 shrink-0 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text}`}>
                        <Icon className="w-7 h-7" strokeWidth={1.5} fill="currentColor" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#191b23] group-hover:text-[#004ac6] transition-colors truncate">
                          {workspaceName}
                        </h4>
                        <p className="text-xs leading-4 text-[#434655] truncate">
                          {campaigns} Active Campaign{campaigns !== 1 ? 's' : ''} • {leads.toLocaleString()} Lead{leads !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <span className="text-xs leading-4 font-medium px-4 py-1 bg-[#e7e7f3] rounded-full text-[#434655]">
                        {workspace.role === "OWNER" ? "Owner" : "Member"}
                      </span>
                      <Link 
                        href={`/workspace/${workspace.workspaceId}`}
                        className="px-6 py-2 bg-[#2563eb] text-[#eeefff] text-sm leading-5 font-semibold tracking-[0.05em] rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
                      >
                        Manage
                      </Link>
                    </div>
                  </article>
                );
              })}

              {/* Empty State / Add Suggestion */}
              <div className="border-2 border-dashed border-[#c3c6d7] rounded-xl p-12 flex flex-col items-center justify-center text-center gap-4 hover:bg-[#f3f3fe] transition-colors group cursor-pointer min-h-[224px]">
                <div className="w-16 h-16 rounded-full bg-[#e1e2ed] flex items-center justify-center text-[#434655] group-hover:scale-110 transition-transform">
                  <Home className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#191b23]">
                    Collaborate on a new project?
                  </p>
                  <p className="text-xs leading-4 text-[#434655]">
                    Create a separate workspace to isolate campaigns and teams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
