"use client";

import { useState } from "react";
import { CheckCircle2, Edit3, Home, PlusCircle, Rocket, UsersRound, Hexagon, X, Check } from "lucide-react";

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
  onUpdateName: (name: string) => Promise<{ status: "success" } | { status: "error"; message: string }>;
};

const workspaceIcons = [Hexagon, Rocket, UsersRound];
const workspaceColors = [
  { bg: "bg-[#dbe1ff]", text: "text-[#004ac6]" },
  { bg: "bg-[#9cf2e8]", text: "text-[#006f67]" },
  { bg: "bg-[#e9ddff]", text: "text-[#5516be]" },
];

export function ProfileWorkspaces({ name, email, role, workspaces, onUpdateName }: Readonly<ProfileWorkspacesProps>) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "U";

  return (
    <main className="bg-[#faf8ff] p-8 text-[#191b23] min-h-svh">
      <div className="mx-auto max-w-[1000px]">
        <section className="mb-12">
          <div className="flex items-end gap-6 mb-6">
            <div className="relative group shrink-0">
              <div className="size-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                <div className="size-full bg-[linear-gradient(135deg,#dbe1ff,#9cf2e8)] flex items-center justify-center text-4xl font-bold text-[#004ac6] group-hover:scale-105 transition-transform duration-500">
                  {initial}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 bg-[#004ac6] text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all" type="button" aria-label="Edit profile image">
                <Edit3 className="size-[18px]" />
              </button>
            </div>
            <div className="pb-2">
              <h2 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23] mb-1">{name}</h2>
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 bg-[#dbe1ff] text-[#003ea8] text-xs leading-4 font-medium rounded uppercase tracking-wider">{role}</span>
                <span className="text-[#434655] text-base leading-6">{email}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <PersonalInfoCard name={name} email={email} onUpdateName={onUpdateName} />
          </div>

          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl leading-8 font-semibold tracking-[-0.01em] text-[#191b23]">Your Workspaces</h3>
              <button className="flex items-center gap-1 text-[#004ac6] text-sm leading-5 font-semibold tracking-[0.05em] hover:bg-[#dbe1ff] px-4 py-2 rounded-lg transition-all active:scale-95" type="button">
                <PlusCircle className="size-5" />
                Create New Workspace
              </button>
            </div>
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
          </div>
        </div>
      </div>
    </main>
  );
}

function PersonalInfoCard({ name, email, onUpdateName }: Readonly<{ name: string; email: string; onUpdateName: ProfileWorkspacesProps["onUpdateName"] }>) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setInputValue(name);
    setError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setInputValue(name);
    setError(null);
  };

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (trimmed === name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onUpdateName(trimmed);
    if (result.status === "error") {
      setError(result.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl leading-8 font-semibold tracking-[-0.01em] text-[#191b23]">Personal Info</h3>
        {!editing && (
          <button onClick={handleEdit} className="text-[#004ac6] text-sm leading-5 font-semibold tracking-[0.05em] hover:underline" type="button">Edit Info</button>
        )}
      </div>
      <div className="space-y-8">
        {editing ? (
          <div className="space-y-2">
            <label className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#434655]">Full Name</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-[#c3c6d7] rounded-lg text-[#191b23] text-base leading-6 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-colors"
                autoFocus
                disabled={saving}
              />
              <button onClick={handleSave} disabled={saving} className="p-2 text-[#006a63] hover:bg-[#e0f5f2] rounded-lg transition-colors disabled:opacity-50" type="button" aria-label="Save">
                <Check className="size-5" />
              </button>
              <button onClick={handleCancel} disabled={saving} className="p-2 text-[#8b1e1e] hover:bg-[#ffe8e8] rounded-lg transition-colors disabled:opacity-50" type="button" aria-label="Cancel">
                <X className="size-5" />
              </button>
            </div>
            {error && <p className="text-xs leading-4 text-[#8b1e1e]">{error}</p>}
          </div>
        ) : (
          <ProfileField label="Full Name">{name}</ProfileField>
        )}
        <ProfileField label="Email Address" verified>{email}</ProfileField>
      </div>
    </div>
  );
}

function ProfileField({ label, children, verified = false }: Readonly<{ label: string; children: React.ReactNode; verified?: boolean }>) {
  return (
    <div className="space-y-2">
      <label className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#434655]">{label}</label>
      <div className="w-full px-4 py-2 bg-[#f3f3fe] border border-[#c3c6d7] rounded-lg text-[#191b23] text-base leading-6 flex items-center justify-between min-h-[40px]">
        <span>{children}</span>
        {verified && <CheckCircle2 className="size-[18px] text-[#006a63]" aria-label="Verified email" />}
      </div>
    </div>
  );
}

function WorkspaceCard({ workspace, index }: Readonly<{ workspace: ProfileWorkspace; index: number }>) {
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