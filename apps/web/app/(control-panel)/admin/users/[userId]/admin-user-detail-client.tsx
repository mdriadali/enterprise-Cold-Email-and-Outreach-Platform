"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Key,
  Mail,
  CheckCircle,
  Building2,
  Network,
  Megaphone,
  CreditCard,
  Trash2,
  UserMinus,
  Power,
  Info,
  Loader2,
  ShieldCheck,
  Shield,
  Users,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { useNotification } from "@repo/ui/notification-provider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/tabs";
import {
  updateUserAdminRole,
  deleteUserAdmin,
  type AdminUserDetailData,
} from "../../../../src/actions/admin/users";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDateTimeUTC(date: Date | null): string {
  if (!date) return "Not verified";
  const month = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${month} at ${time} UTC`;
}

interface AdminUserDetailClientProps {
  user: AdminUserDetailData;
}

export function AdminUserDetailClient({ user }: AdminUserDetailClientProps) {
  const router = useRouter();
  const { notify } = useNotification();
  const rolePanelRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [role, setRole] = React.useState<"ADMIN" | "USER">(user.role);
  const [roleLoading, setRoleLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const scrollToRolePanel = () => {
    setActiveTab("overview");
    setTimeout(() => {
      rolePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const totalWorkspaces =
    user.ownedWorkspacesCount + user.membershipWorkspacesCount;
  const quotaExhausted = user.remainingFreeWorkspaces === 0;

  const handleRoleUpdate = async (newRole: "ADMIN" | "USER") => {
    if (newRole === role) return;
    setRoleLoading(true);
    try {
      const result = await updateUserAdminRole(user.id, newRole);
      if (result.status === "success") {
        setRole(newRole);
        notify({
          tone: "success",
          title: "Role updated",
          message: result.message,
        });
      } else {
        notify({
          tone: "error",
          title: "Role update failed",
          message: result.message,
        });
      }
    } catch {
      notify({
        tone: "error",
        title: "Role update failed",
        message: "Could not reach the server.",
      });
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Permanently delete ${user.name}? This action cannot be undone.`
      )
    )
      return;
    setDeleteLoading(true);
    try {
      const result = await deleteUserAdmin(user.id);
      if (result.status === "success") {
        notify({
          tone: "success",
          title: "User deleted",
          message: result.message,
        });
        router.push("/admin/users");
      } else {
        notify({
          tone: "error",
          title: "Delete failed",
          message: result.message,
        });
      }
    } catch {
      notify({
        tone: "error",
        title: "Delete failed",
        message: "Could not reach the server.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004ac6] hover:text-[#003ea8] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to User Directory
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-[#737686]">
          <span>Identity Provider:</span>
          <span className="font-mono text-[#191b23] font-medium">
            Authenticated Session
          </span>
        </div>
      </div>

      {/* USER HEADER CARD */}
      <section className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-xl bg-[#dbe1ff] text-[#00174b] flex items-center justify-center text-2xl font-bold border-2 border-[#2563eb]">
                {getInitials(user.name)}
              </div>
              {user.emailVerifiedAt && (
                <span
                  className="absolute -bottom-1 -right-1 bg-white text-[#006f67] rounded-full p-0.5 border border-[#c3c6d7]"
                  title="Verified Identity"
                >
                  <CheckCircle className="w-5 h-5" />
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[#191b23] tracking-tight">
                  {user.name}
                </h1>
                <button
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ededf9] text-[#434655] font-mono text-xs hover:bg-[#e7e7f3] transition-colors"
                  title="Copy User ID"
                  onClick={() => {
                    navigator.clipboard.writeText(user.id);
                    notify({
                      tone: "info",
                      title: "Copied",
                      message: "User ID copied to clipboard.",
                    });
                  }}
                >
                  <span>{user.id}</span>
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <Badge
                  variant="tertiary"
                  className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold"
                >
                  {role}
                </Badge>
                {user.emailVerifiedAt ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#99efe5] text-[#006f67]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006a63]" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#ffdad6] text-[#ba1a1a]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                    Unverified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#434655]">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-[#737686]" />
                  <span className="font-mono">{user.email}</span>
                </span>
                {user.emailVerifiedAt && (
                  <>
                    <span className="text-[#c3c6d7]">&bull;</span>
                    <span className="flex items-center gap-1 text-[#006f67]">
                      <CheckCircle className="w-4 h-4" />
                      Verified on {formatDateTimeUTC(user.emailVerifiedAt)}
                    </span>
                  </>
                )}
                <span className="text-[#c3c6d7]">&bull;</span>
                <span className="text-[#737686]">
                  Free Workspaces:{" "}
                  <strong className="text-[#191b23] font-medium">
                    {user.remainingFreeWorkspaces} available
                  </strong>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-1.5">
              <Key className="w-4 h-4 text-[#004ac6]" />
              Impersonate Session
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={scrollToRolePanel}>
              <ShieldCheck className="w-4 h-4 text-[#004ac6]" />
              Change Role
            </Button>
            <Link
              href={`/admin/users/${user.id}/role`}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#2563eb] text-white text-sm font-semibold shadow-sm hover:bg-[#004ac6] transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Update Role Page
            </Link>
            <Button
              variant="destructive"
              className="gap-1.5"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              )}
              Suspend
            </Button>
          </div>
        </div>
      </section>

      {/* KPI SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:border-[#737686] transition-colors">
          <div className="flex items-center justify-between text-[#737686] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Owned Workspaces
            </span>
            <Building2 className="w-5 h-5 text-[#004ac6]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#191b23] tracking-tight">
              {user.ownedWorkspacesCount}
            </span>
            <span className="text-sm text-[#434655]">Workspaces</span>
          </div>
          <p className="text-xs text-[#737686] mt-2 flex items-center gap-1">
            <span className="font-mono text-xs text-[#004ac6] font-medium">
              ownedWorkspacesCount
            </span>
            <span>&bull; Created &amp; billed as owner</span>
          </p>
        </Card>

        <Card className="p-4 hover:border-[#737686] transition-colors">
          <div className="flex items-center justify-between text-[#737686] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Member Workspaces
            </span>
            <Network className="w-5 h-5 text-[#006f67]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#191b23] tracking-tight">
              {user.membershipWorkspacesCount}
            </span>
            <span className="text-sm text-[#434655]">Workspaces</span>
          </div>
          <p className="text-xs text-[#737686] mt-2 flex items-center gap-1">
            <span className="font-mono text-xs text-[#006f67] font-medium">
              membershipWorkspacesCount
            </span>
            <span>&bull; Collaborator access</span>
          </p>
        </Card>

        <Card className="p-4 hover:border-[#737686] transition-colors">
          <div className="flex items-center justify-between text-[#737686] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Total Campaigns
            </span>
            <Megaphone className="w-5 h-5 text-[#632ecd]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#191b23] tracking-tight">
              {user.campaignsCount}
            </span>
            <span className="text-sm text-[#434655]">Campaigns</span>
          </div>
          <p className="text-xs text-[#737686] mt-2 flex items-center gap-1">
            <span className="font-mono text-xs text-[#632ecd] font-medium">
              campaignsCount
            </span>
            <span>&bull; Across all workspaces</span>
          </p>
        </Card>

        <Card className="p-4 hover:border-[#737686] transition-colors">
          <div className="flex items-center justify-between text-[#737686] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Free Workspace Allotment
            </span>
            <CreditCard className="w-5 h-5 text-[#ba1a1a]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[#191b23] tracking-tight">
                {user.remainingFreeWorkspaces}
              </span>
              <span className="text-sm text-[#434655]">Available</span>
            </div>
            {quotaExhausted && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ffdad6] text-[#ba1a1a]">
                Quota Exhausted
              </span>
            )}
          </div>
          <p className="text-xs text-[#737686] mt-2 flex items-center gap-1">
            <span className="font-mono text-xs text-[#ba1a1a] font-medium">
              remainingFreeWorkspaces
            </span>
            <span>
              &bull;{" "}
              {user.remainingFreeWorkspaces === 0
                ? "1 of 1 Free Tier Used"
                : `${user.remainingFreeWorkspaces} remaining`}
            </span>
          </p>
        </Card>
      </section>

      {/* TABS */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="border-b border-[#c3c6d7]">
          <TabsList className="flex space-x-6">
            <TabsTrigger
              value="overview"
              icon={<Building2 className="w-4 h-4" />}
              count={totalWorkspaces}
            >
              Overview &amp; Workspaces
            </TabsTrigger>
            <TabsTrigger
              value="campaigns"
              icon={<Megaphone className="w-4 h-4" />}
              count={user.campaignsCount}
            >
              Campaign Activity
            </TabsTrigger>
            <TabsTrigger
              value="security"
              icon={<Shield className="w-4 h-4" />}
            >
              Security &amp; RBAC Audit
            </TabsTrigger>
            <TabsTrigger value="quotas">
              API &amp; Integration Quotas
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#c3c6d7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#004ac6]" />
                    <div>
                      <h2 className="text-base font-bold text-[#191b23]">
                        Associated Workspaces
                      </h2>
                      <p className="text-xs text-[#737686]">
                        Workspaces created or co-managed by {user.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f3f3fe] border-b border-[#c3c6d7] text-xs text-[#737686] font-semibold">
                        <th className="py-2 px-4">Workspace Name</th>
                        <th className="py-2 px-4">Role &amp; Tier</th>
                        <th className="py-2 px-4">Members</th>
                        <th className="py-2 px-4">Campaigns</th>
                        <th className="py-2 px-4">Created</th>
                        <th className="py-2 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c3c6d7] text-sm">
                      {totalWorkspaces === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-[#737686]">
                            <Building2 className="w-10 h-10 mx-auto mb-2 text-[#c3c6d7]" />
                            <p className="text-sm font-medium">No workspaces found</p>
                            <p className="text-xs text-[#737686] mt-1">
                              This user is not associated with any workspaces.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-[#737686]">
                            <Building2 className="w-10 h-10 mx-auto mb-2 text-[#c3c6d7]" />
                            <p className="text-sm font-medium">
                              {totalWorkspaces} workspace{totalWorkspaces !== 1 ? "s" : ""} associated
                            </p>
                            <p className="text-xs text-[#737686] mt-1">
                              Workspace details will be available soon.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="mt-0">
              <div className="bg-white border border-[#c3c6d7] rounded-xl p-8 shadow-sm text-center">
                <Megaphone className="w-12 h-12 text-[#c3c6d7] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#191b23]">
                  Campaign Activity
                </h3>
                <p className="text-sm text-[#737686] mt-1">
                  {user.campaignsCount > 0
                    ? `${user.campaignsCount} campaign${user.campaignsCount !== 1 ? "s" : ""} across all workspaces.`
                    : "No campaigns found for this user."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <div className="bg-white border border-[#c3c6d7] rounded-xl p-8 shadow-sm text-center">
                <Shield className="w-12 h-12 text-[#c3c6d7] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#191b23]">
                  Security &amp; RBAC Audit
                </h3>
                <p className="text-sm text-[#737686] mt-1">
                  Security audit log coming soon.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="quotas" className="mt-0">
              <div className="bg-white border border-[#c3c6d7] rounded-xl p-8 shadow-sm text-center">
                <svg
                  className="w-12 h-12 text-[#c3c6d7] mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-[#191b23]">
                  API &amp; Integration Quotas
                </h3>
                <p className="text-sm text-[#737686] mt-1">
                  API usage quotas coming soon.
                </p>
              </div>
            </TabsContent>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* ROLE & PERMISSIONS */}
            <div ref={rolePanelRef} className="bg-white border border-[#c3c6d7] rounded-xl p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#c3c6d7]">
                <Users className="w-5 h-5 text-[#004ac6]" />
                <h3 className="text-base font-bold text-[#191b23]">
                  Role &amp; Permissions
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#737686]">
                  Assign administrative authority level. Permissions take effect
                  immediately.
                </p>
                <label
                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    role === "ADMIN"
                      ? "border-[#004ac6] bg-[#dbe1ff]/20"
                      : "border-[#c3c6d7] bg-white hover:bg-[#f3f3fe]"
                  }`}
                >
                  <input
                    type="radio"
                    name="user_role"
                    value="ADMIN"
                    checked={role === "ADMIN"}
                    onChange={() => handleRoleUpdate("ADMIN")}
                    disabled={roleLoading}
                    className="mt-0.5 accent-[#004ac6]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#191b23] flex items-center gap-1">
                      ADMIN
                      {user.role === "ADMIN" && (
                        <span className="text-xs text-[#004ac6] font-normal">
                          (Current)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#434655]">
                      Full tenant management, campaign deletion, team
                      impersonation, and billing access.
                    </p>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    role === "USER"
                      ? "border-[#004ac6] bg-[#dbe1ff]/20"
                      : "border-[#c3c6d7] bg-white hover:bg-[#f3f3fe]"
                  }`}
                >
                  <input
                    type="radio"
                    name="user_role"
                    value="USER"
                    checked={role === "USER"}
                    onChange={() => handleRoleUpdate("USER")}
                    disabled={roleLoading}
                    className="mt-0.5 accent-[#004ac6]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#191b23]">
                      USER
                    </div>
                    <p className="text-xs text-[#737686]">
                      Standard workspace member. Constrained to designated
                      workspaces and campaign sequences.
                    </p>
                  </div>
                </label>
              </div>
              <div className="p-2 rounded bg-[#e7e7f3] border-l-2 border-[#004ac6] text-xs text-[#434655] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
                <span>
                  Modifying user roles triggers an immutable SOC2 administrative
                  audit entry.
                </span>
              </div>
              <Button
                className="w-full"
                onClick={() => handleRoleUpdate(role)}
                disabled={roleLoading || role === user.role}
              >
                {roleLoading && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Update Role Assignment
              </Button>
            </div>

            {/* QUOTA OVERRIDE */}
            <div className="bg-white border border-[#c3c6d7] rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#c3c6d7]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#006f67]" />
                  <h3 className="text-base font-bold text-[#191b23]">
                    Quota Override
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-sm text-[#191b23] font-medium">
                    Free Workspace Cap
                  </span>
                  <p className="text-xs text-[#737686]">
                    Remaining allowance:{" "}
                    <strong
                      className={`font-semibold ${quotaExhausted ? "text-[#ba1a1a]" : "text-[#006f67]"}`}
                    >
                      {user.remainingFreeWorkspaces}
                    </strong>
                  </p>
                </div>
                <button className="px-2 py-1.5 border border-[#004ac6] text-[#004ac6] hover:bg-[#dbe1ff]/20 rounded-lg text-xs transition-colors flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Grant +1 Free
                </button>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-white border border-[#ba1a1a]/30 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-[#c3c6d7]">
                <TriangleAlert className="w-5 h-5 text-[#ba1a1a]" />
                <h3 className="text-base font-bold text-[#ba1a1a]">
                  Danger Zone
                </h3>
              </div>
              <div className="space-y-1">
                <button className="w-full py-1.5 px-2 text-left text-xs text-[#434655] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded flex items-center justify-between transition-colors">
                  <span>Revoke All Active Sessions</span>
                  <Power className="w-4 h-4" />
                </button>
                <button className="w-full py-1.5 px-2 text-left text-xs text-[#434655] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded flex items-center justify-between transition-colors">
                  <span>Deactivate {user.name}</span>
                  <UserMinus className="w-4 h-4" />
                </button>
                <button
                  className="w-full py-1.5 px-2 text-left text-xs text-[#ba1a1a] font-semibold hover:bg-[#ffdad6] rounded flex items-center justify-between transition-colors"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  <span>Delete User Account</span>
                  {deleteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Tabs>

      {/* FOOTER */}
      <footer className="border-t border-[#c3c6d7] bg-[#f3f3fe] px-6 py-2 select-none rounded-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-[#737686] font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[#004ac6] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#006f67]" />
              GET /admin/users/{user.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Role-Based Access Control (RBAC) Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
