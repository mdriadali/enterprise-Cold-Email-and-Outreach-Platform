"use client";

import {
  FilePenLine, Shield, UserPlus, MoreVertical, X, Clock, Zap, Mail, Loader, Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addMember } from "../../../../src/actions/workspace/add-member";
import { deleteMember } from "../../../../src/actions/workspace/delete-member";
import { useNotification } from "@repo/ui/notification-provider";
import type { WorkspaceInfoData } from "../../../../src/actions/workspace/workspace-info";
import { useAppDispatch } from "../../../../src/states/hooks";
import { selectWorkspace } from "../../../../src/states/workspace-slice";

type OwnerInfo = { id: string; role: string; user: { id: string; name: string; email: string } };

type Props = {
  info: WorkspaceInfoData;
  limits: Record<string, number>;
  owner: OwnerInfo | null;
};

const subscriptionBadge: Record<string, { label: string; bg: string; text: string }> = {
  STARTER: { label: "Starter", bg: "bg-[#e1e2ed]", text: "text-[#434655]" },
  PROFESSIONAL: { label: "Professional", bg: "bg-[#dbe1ff]", text: "text-[#004ac6]" },
  ULTRA: { label: "Ultra", bg: "bg-[#e9ddff]", text: "text-[#632ecd]" },
};

function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className={`rounded-full bg-[#dbe1ff] text-[#00174b] flex items-center justify-center font-bold text-sm ${className ?? "size-10"}`}>
      {initials}
    </div>
  );
}

function AvatarStack({ members, total, max = 3 }: { members: { user: { name: string } }[]; total: number; max?: number }) {
  const visible = members.slice(0, max);
  const remainder = total - visible.length;
  return (
    <div className="flex -space-x-2">
      {visible.map((m, i) => (
        <Avatar key={i} name={m.user.name} className="size-10 border-2 border-white" />
      ))}
      {remainder > 0 && (
        <div className="size-10 rounded-full border-2 border-white bg-[#004ac6] flex items-center justify-center text-white text-xs font-bold">
          +{remainder}
        </div>
      )}
    </div>
  );
}

export function MembersClient({ info, limits, owner }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { notify } = useNotification();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removingMember, setRemovingMember] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    dispatch(selectWorkspace({ id: info.id, name: info.name }));
    document.cookie = `selectedWorkspaceId=${info.id};path=/;max-age=${60*60*24*365};SameSite=Lax`;
  }, [dispatch, info.id, info.name]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      const result = await addMember(info.id, { email: inviteEmail.trim(), role: "MEMBER" });
      if (result.status === "error") {
        notify({ title: "Failed", message: result.message, tone: "error" });
        return;
      }
      notify({ title: "Member added", message: `${inviteEmail.trim()} has been added.`, tone: "success" });
      setShowInviteModal(false);
      setInviteEmail("");
      router.refresh();
    } catch {
      notify({ title: "Failed", message: "Something went wrong.", tone: "error" });
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRemoveMember() {
    if (!removingMember) return;
    const memberId = removingMember.id;
    setRemovingMember(null);
    try {
      const result = await deleteMember(info.id, memberId);
      if (result.status === "error") {
        notify({ title: "Failed", message: result.message, tone: "error" });
        return;
      }
      notify({ title: "Member removed", message: `${removingMember.name} has been removed.`, tone: "success" });
      router.refresh();
    } catch {
      notify({ title: "Failed", message: "Something went wrong.", tone: "error" });
    }
  }

  const sub = subscriptionBadge[info.subscription] ?? subscriptionBadge.STARTER!;
  const memberCount = info._count.members;
  const memberLimit = limits.members ?? 1;
  const seatPct = Math.min(Math.round((memberCount / memberLimit) * 100), 100);

  const initials = (name: string) =>
    name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

  const avatarColors = ["bg-[#dbe1ff] text-[#00174b]", "bg-[#9cf2e8] text-[#00201d]", "bg-[#e9ddff] text-[#23005c]", "bg-[#ffdad6] text-[#ba1a1a]", "bg-[#f3f3fe] text-[#434655]"];

  const joinDates = ["Jan 12, 2023", "Mar 05, 2023", "May 19, 2023", "Aug 22, 2023", "Nov 03, 2023", "Feb 14, 2024", "Apr 08, 2024", "Jul 19, 2024", "Sep 01, 2024", "Oct 11, 2024"];

  return (
    <div className="min-h-0 flex-1 overflow-auto p-[32px] space-y-[24px]">
      {/* Workspace Header Bento Area */}
      <div className="grid grid-cols-12 gap-[24px]">
        {/* Workspace Title Card */}
        <div className="col-span-12 lg:col-span-8 bg-white/80 backdrop-blur-[8px] border border-[#c3c6d7]/30 rounded-xl p-[24px] flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10 space-y-[8px]">
            <div className="flex items-center gap-[8px]">
              <span className={`px-[12px] py-[4px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] rounded-full ${sub.bg} ${sub.text}`}>
                {sub.label}
              </span>
              <span className="text-[14px] leading-[20px] text-[#737686]">• Active Subscription</span>
            </div>
            <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">{info.name}</h1>
            <p className="text-[16px] leading-[24px] text-[#434655] max-w-lg">
              Central hub for managing regional team permissions, outreach campaign oversight, and organizational scaling.
            </p>
          </div>
          <div className="mt-[24px] flex items-center gap-[16px] relative z-10">
            <AvatarStack members={info.members} total={memberCount} />
            <span className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">
              {memberCount} Member{memberCount !== 1 ? "s" : ""} active this week
            </span>
          </div>
          <div className="absolute -right-16 -top-16 size-64 bg-[#004ac6]/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Owner Card */}
        <div className="col-span-12 lg:col-span-4 bg-white/70 backdrop-blur-[8px] border border-[#c3c6d7]/30 rounded-xl p-[24px] flex flex-col">
          <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase mb-[16px]">Workspace Owner</p>
          <div className="flex items-center gap-[16px] mb-[16px]">
            <Avatar name={owner?.user.name ?? "Owner"} className="size-14 rounded-xl" />
            <div>
              <p className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">{owner?.user.name ?? "—"}</p>
              <p className="text-[14px] leading-[20px] text-[#434655]">{owner?.user.email ?? "—"}</p>
            </div>
          </div>
          <button
            className="mt-auto w-full py-[12px] bg-white border border-[#c3c6d7] text-[#191b23] text-[14px] leading-[20px] font-semibold tracking-[0.05em] rounded-lg hover:bg-[#f3f3fe] transition-colors flex items-center justify-center gap-[8px]"
            type="button"
            onClick={() => notify({ title: "Transfer Ownership", message: "Feature coming soon.", tone: "info" })}
          >
            <FilePenLine className="size-[18px]" />
            Transfer Ownership
          </button>
        </div>
      </div>

      {/* Members Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px]">
        <div>
          <h2 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">Team Management</h2>
          <p className="text-[16px] leading-[24px] text-[#434655]">Audit roles, manage permissions, and invite new strategists.</p>
        </div>
        <div className="flex gap-[8px]">
          <button
            className="px-[24px] py-[12px] border border-[#c3c6d7] text-[#191b23] text-[14px] leading-[20px] font-semibold tracking-[0.05em] rounded-lg hover:bg-[#f3f3fe] transition-colors flex items-center gap-[8px] bg-white"
            type="button"
            onClick={() => notify({ title: "Manage Roles", message: "Feature coming soon.", tone: "info" })}
          >
            <Shield className="size-[18px]" />
            Manage Roles
          </button>
          <button
            className="px-[24px] py-[12px] bg-[#004ac6] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-[8px] shadow-sm"
            type="button"
            onClick={() => setShowInviteModal(true)}
          >
            <UserPlus className="size-[18px]" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-12 gap-[24px]">
        {/* Main Members Table */}
        <div className="col-span-12 xl:col-span-8">
          <div className="bg-white/70 backdrop-blur-[8px] border border-[#c3c6d7]/30 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f3fe] border-b border-[#c3c6d7]">
                <tr>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Member</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Role</th>
                  <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Join Date</th>
                  <th className="px-[24px] py-[16px]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d7]/50">
                {info.members.map((member, i) => (
                  <tr key={member.id} className="hover:bg-[#f3f3fe] transition-colors group">
                    <td className="px-[24px] py-[16px]">
                      <div className="flex items-center gap-[16px]">
                        <div className={`size-10 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center font-bold`}>
                          {initials(member.user.name)}
                        </div>
                        <div>
                          <p className="text-[16px] leading-[24px] font-semibold text-[#191b23]">{member.user.name}</p>
                          <p className="text-[12px] leading-[16px] text-[#434655]">{member.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <span className={`px-[8px] py-[4px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] rounded-md border ${
                        member.role === "OWNER"
                          ? "bg-[#004ac6]/10 text-[#004ac6] border-[#004ac6]/20"
                          : "bg-[#737686]/10 text-[#434655] border-transparent"
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-[24px] py-[16px] text-[14px] leading-[20px] text-[#434655]">{joinDates[i % joinDates.length]}</td>
                    <td className="px-[24px] py-[16px] text-right">
                      {member.role !== "OWNER" && (
                        <button
                          className="p-[8px] text-[#737686] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded-full"
                          type="button"
                          aria-label="Remove member"
                          onClick={() => setRemovingMember({ id: member.id, name: member.user.name })}
                        >
                          <Trash2 className="size-[18px]" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-[16px] flex justify-center bg-[#f3f3fe]/30">
              <button className="text-[#004ac6] text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:underline" type="button">
                View All Members
              </button>
            </div>
          </div>
        </div>

        {/* Invitations / Pending Column */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-[24px]">
          {/* Pending Invitations */}
          <div className="bg-white/70 backdrop-blur-[8px] border border-[#c3c6d7]/30 rounded-xl p-[24px]">
            <div className="flex items-center justify-between mb-[16px]">
              <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Pending Invitations</h3>
              <span className="px-[8px] py-[4px] bg-[#632ecd] text-white text-[12px] leading-[16px] font-semibold tracking-[0.05em] rounded-full">2</span>
            </div>
            <div className="space-y-[16px]">
              {[
                { email: "jordan.vance@techcorp.com", sent: "Sent 2 days ago" },
                { email: "amy.chen@outreach.io", sent: "Sent 5 hours ago" },
              ].map((invite, i) => (
                <div key={i} className="p-[16px] border border-[#c3c6d7]/50 rounded-lg bg-[#f3f3fe]/50">
                  <div className="flex justify-between items-start mb-[8px]">
                    <p className="text-[16px] leading-[24px] font-semibold text-[#191b23]">{invite.email}</p>
                    <button
                      className="text-[#737686] hover:text-[#ba1a1a] transition-colors"
                      type="button"
                      aria-label="Close invitation"
                      onClick={() => notify({ title: "Invitation removed", message: `${invite.email} invitation removed.`, tone: "success" })}
                    >
                      <X className="size-[18px]" />
                    </button>
                  </div>
                  <div className="flex items-center gap-[8px] text-[#434655] text-[14px] leading-[20px] mb-[12px]">
                    <Clock className="size-[16px]" />
                    {invite.sent}
                  </div>
                  <div className="flex gap-[8px]">
                    <button
                      className="flex-1 py-[8px] bg-white border border-[#c3c6d7] text-[#191b23] text-[12px] leading-[16px] font-semibold tracking-[0.05em] rounded-md hover:bg-[#f3f3fe] transition-colors"
                      type="button"
                      onClick={() => notify({ title: "Invitation resent", message: `Resent to ${invite.email}.`, tone: "success" })}
                    >
                      Resend
                    </button>
                    <button
                      className="flex-1 py-[8px] border border-[#ba1a1a]/30 text-[#ba1a1a] text-[12px] leading-[16px] font-semibold tracking-[0.05em] rounded-md hover:bg-[#ffdad6] transition-colors"
                      type="button"
                      onClick={() => notify({ title: "Invitation revoked", message: `Revoked for ${invite.email}.`, tone: "success" })}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seat Usage Card */}
          <div className="bg-[#004ac6] border border-[#004ac6] rounded-xl p-[24px] text-white">
            <div className="flex items-center gap-[16px] mb-[16px]">
              <div className="p-[8px] bg-white/20 rounded-lg">
                <Zap className="size-[20px]" />
              </div>
              <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase">Seat Usage</p>
            </div>
            <div className="mb-[16px]">
              <div className="flex justify-between items-end text-[24px] leading-[32px] font-semibold tracking-[-0.01em] mb-[8px]">
                <span>{memberCount} / {memberLimit}</span>
                <span>{seatPct}%</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${seatPct}%` }} />
              </div>
            </div>
            <p className="text-[14px] leading-[20px] text-white/80">
              You have {memberLimit - memberCount} enterprise seats available. Add more members to maximize your outreach velocity.
            </p>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-[0_22px_50px_rgb(28_33_67_/_0.18)] p-[24px] max-w-sm w-full mx-4 border border-[#c3c6d7]">
            <div className="flex items-center justify-between mb-[16px]">
              <h3 className="text-[20px] leading-[28px] font-bold text-[#191b23]">Invite Member</h3>
              <button
                className="p-[8px] text-[#737686] hover:bg-[#f3f3fe] rounded-full transition-colors"
                type="button"
                onClick={() => setShowInviteModal(false)}
              >
                <X className="size-[18px]" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-[16px]">
              <div className="space-y-[4px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase" htmlFor="invite-email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-[12px] top-1/2 -translate-y-1/2 size-[18px] text-[#737686]" />
                  <input
                    id="invite-email"
                    type="email"
                    required
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-[38px] pr-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] leading-[20px] text-[#191b23] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] transition-colors bg-white"
                  />
                </div>
              </div>
              <div className="space-y-[4px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase" htmlFor="invite-role">Role</label>
                <div className="relative">
                  <Shield className="absolute left-[12px] top-1/2 -translate-y-1/2 size-[18px] text-[#737686]" />
                  <select
                    id="invite-role"
                    disabled
                    className="w-full pl-[38px] pr-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] leading-[20px] text-[#191b23] focus:outline-none focus:border-[#004ac6] transition-colors bg-[#f3f3fe] cursor-not-allowed"
                  >
                    <option value="MEMBER">Member</option>
                  </select>
                </div>
                <p className="text-[12px] leading-[16px] text-[#737686]">Only MEMBER role is available. Transfer ownership from the owner card.</p>
              </div>
              <div className="flex gap-[12px] justify-end pt-[8px]">
                <button
                  className="px-[16px] py-[10px] rounded-xl border border-[#c3c6d7] bg-white text-[14px] leading-[20px] font-semibold text-[#434655] hover:bg-[#f3f3fe] transition-colors"
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-[16px] py-[10px] rounded-xl bg-[#004ac6] text-white text-[14px] leading-[20px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-[8px] disabled:opacity-50"
                  type="submit"
                  disabled={inviteLoading || !inviteEmail.trim()}
                >
                  {inviteLoading ? <Loader className="size-[18px] animate-spin" /> : <UserPlus className="size-[18px]" />}
                  {inviteLoading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {removingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-[0_22px_50px_rgb(28_33_67_/_0.18)] p-[24px] max-w-sm w-full mx-4 border border-[#c3c6d7]">
            <div className="flex items-center gap-3 mb-[16px]">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#ba1a1a]/10 text-[#ba1a1a]">
                <Trash2 className="size-5" />
              </div>
              <div>
                <p className="text-[16px] leading-[24px] font-bold text-[#191b23]">Remove member?</p>
                <p className="text-[14px] leading-[20px] text-[#434655]">{removingMember.name} will be removed from this workspace.</p>
              </div>
            </div>
            <div className="flex gap-[12px] justify-end">
              <button
                className="px-[16px] py-[10px] rounded-xl border border-[#c3c6d7] bg-white text-[14px] leading-[20px] font-semibold text-[#434655] hover:bg-[#f3f3fe] transition-colors"
                type="button"
                onClick={() => setRemovingMember(null)}
              >
                Cancel
              </button>
              <button
                className="px-[16px] py-[10px] rounded-xl bg-[#ba1a1a] text-white text-[14px] leading-[20px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-[8px]"
                type="button"
                onClick={handleRemoveMember}
              >
                <Trash2 className="size-[18px]" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
