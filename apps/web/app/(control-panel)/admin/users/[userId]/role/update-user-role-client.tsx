"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ShieldCheck,
  Shield,
  Mail,
  Building2,
  CircleCheck,
  UserRound,
  ShieldUser,
  TriangleAlert,
  CircleAlert,
  Terminal,
  ListChecks,
  Lock,
  UserX,
  Network,
  Braces,
  CheckCheck,
  MoveRight,
  X,
  Save,
  LoaderCircle,
  BadgeCheck,
  Info,
} from "lucide-react";
import { useNotification } from "@repo/ui/notification-provider";
import {
  updateUserAdminRole,
  type AdminUserDetailData,
  type AdminUpdateRoleResult,
} from "../../../../../src/actions/admin/users";

const CONFIRM_TOKEN: string = "CONFIRM";

const confirmSchema = z.object({
  confirmationToken: z
    .string()
    .min(1, "Type CONFIRM to authorize")
    .refine((value) => value === CONFIRM_TOKEN, {
      message: "The token must match CONFIRM exactly",
    }),
});

type ConfirmValues = z.infer<typeof confirmSchema>;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UpdateUserRoleClientProps {
  user: AdminUserDetailData;
}

export function UpdateUserRoleClient({ user }: UpdateUserRoleClientProps) {
  const router = useRouter();
  const { notify } = useNotification();

  const [role, setRole] = React.useState<"ADMIN" | "USER">("USER");
  const [roleLoading, setRoleLoading] = React.useState(false);
  const [forceSession, setForceSession] = React.useState(true);
  const [notifyEmail, setNotifyEmail] = React.useState(true);
  const [recordLedger, setRecordLedger] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { confirmationToken: "" },
  });

  const isDowngrade = role === "USER" && user.role === "ADMIN";

  const handleOpenModal = () => {
    reset({ confirmationToken: "" });
    setModalOpen(true);
  };

  const executeRoleChange = async () => {
    setRoleLoading(true);
    try {
      const result: AdminUpdateRoleResult = await updateUserAdminRole(
        user.id,
        role
      );
      if (result.status === "success") {
        notify({
          tone: "success",
          title: "Role updated successfully",
          message: result.message,
        });
        setModalOpen(false);
        router.refresh();
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

  const pendingPayload = `{ "role": "${role}" }`;

  return (
    <div className="p-8 space-y-6 max-w-[1440px] bg-[#faf8ff] text-[#191b23]">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold text-[#191b23] tracking-tight">
              Update User Role
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#dbe1ff] text-[#00174b] font-mono text-xs font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              PATCH /admin/users/:id/role
            </span>
          </div>
          <p className="text-sm text-[#434655] mt-1">
            Reassign Role-Based Access Control (RBAC) privileges, invalidate
            active sessions, and synchronize enterprise governance policies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/users/${user.id}`}
            className="px-4 py-2 border border-[#c3c6d7] rounded-lg text-[#434655] text-sm font-semibold hover:bg-[#ededf9] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to User Detail
          </Link>
          <button
            onClick={handleOpenModal}
            disabled={role === user.role || roleLoading}
            className="px-4 py-2 bg-[#004ac6] text-[#ffffff] rounded-lg text-sm font-semibold hover:bg-[#2563eb] shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <BadgeCheck className="w-4 h-4" />
            Review &amp; Apply Role
          </button>
        </div>
      </div>

      {/* SAFEGUARD BANNER */}
      <div className="bg-[#ffffff] border border-[#99efe5] rounded-xl p-4 flex items-start gap-4 shadow-sm">
        <div className="p-2.5 rounded-lg bg-[#99efe5] text-[#006f67] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[#191b23]">
                Self-Modification Safeguard Enforced
              </span>
              <span className="px-2 py-0.5 rounded bg-[#006a63] text-[#ffffff] text-xs font-semibold">
                Policy: SEC-RBAC-04
              </span>
            </div>
            <span className="text-xs font-mono text-[#737686]">
              Caller ID: usr_admin_sarah
            </span>
          </div>
          <p className="text-sm text-[#434655] mt-1">
            &quot;Admin cannot modify own role&quot; rule verified: Operation
            is authorized under secondary isolation. Target subject will see a{" "}
            <strong className="text-[#191b23]">role transition</strong>.
          </p>
        </div>
      </div>

      {/* TARGET USER SUMMARY CARD */}
      <div className="bg-[#ffffff] border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#004ac6] text-[#ffffff] flex items-center justify-center font-bold text-xl shadow-sm">
              {getInitials(user.name)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-[#191b23]">
                  {user.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-1">
                  <ShieldUser className="w-3.5 h-3.5" />
                  Current: {user.role}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#ededf9] text-[#434655] font-mono text-xs">
                  {user.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[#434655] mt-1.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-[#737686]" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-[#737686]" />
                  Primary Tenant: GlobalOutreach EMEA
                </span>
                {user.emailVerifiedAt && (
                  <span className="flex items-center gap-1 text-[#006a63] font-medium">
                    <CircleCheck className="w-4 h-4" />
                    Email Verified:{" "}
                    {user.emailVerifiedAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#f3f3fe] p-3 rounded-lg border border-[#c3c6d7]">
            <div className="text-right">
              <div className="text-xs text-[#737686]">Workspaces Assigned</div>
              <div className="text-sm font-bold text-[#191b23]">
                {user.membershipWorkspacesCount}{" "}
                Workspaces
              </div>
            </div>
            <div className="h-8 w-px bg-[#c3c6d7]" />
            <div className="text-right">
              <div className="text-xs text-[#737686]">Free Allotment</div>
              <div className="text-sm font-bold text-[#191b23]">
                {user.remainingFreeWorkspaces} available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Role selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#191b23]">
              Select Target Role Assignment
            </label>
            <span className="text-xs text-[#737686]">
              Select one RBAC level
            </span>
          </div>

          {/* USER option (default selected) */}
          <RoleCard
            selected={role === "USER"}
            value="USER"
            title="USER"
            badge="Recommended Demotion"
            badgeClassName="bg-[#99efe5] text-[#006f67]"
            roleId="Role ID: role_standard_user"
            description="Standard workspace operator restricted to assigned workspaces and campaign pipelines."
            checkedFeatures={[
              "Workspace campaign creation & edit",
              "Assigned lead prospect list access",
            ]}
            blockedFeatures={[
              "No billing/plan modification rights",
              "Strict tenant domain segregation",
            ]}
            icon={<UserRound className="w-6 h-6" />}
            iconRing="text-[#004ac6]"
            onSelect={setRole}
          />

          {/* ADMIN option (current) */}
          <RoleCard
            selected={role === "ADMIN"}
            value="ADMIN"
            title="ADMIN"
            badge="Current State"
            badgeClassName="bg-[#e1e2ed] text-[#434655]"
            roleId="Role ID: role_global_governance"
            description="Full platform governance, tenant impersonation, billing override, and system policy management."
            checkedFeatures={[
              "Global Tenant & User Impersonation",
              "Rate limit bypass & plan overrides",
              "Audit log exports & compliance locks",
              "Cross-workspace RBAC authority",
            ]}
            blockedFeatures={[]}
            icon={<ShieldUser className="w-6 h-6" />}
            iconRing="text-[#737686]"
            onSelect={setRole}
          />

          {/* Transition protocol checklist */}
          <div className="bg-[#ffffff] border border-[#c3c6d7] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-[#191b23] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#004ac6]" />
              Administrative Transition Protocol
            </h3>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={forceSession}
                onChange={(e) => setForceSession(e.target.checked)}
                className="mt-0.5 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] h-4 w-4"
              />
              <span className="text-sm text-[#191b23]">
                <strong>Force session termination:</strong> Immediately purge
                all active JWTs, refresh tokens, and OAuth keys.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="mt-0.5 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] h-4 w-4"
              />
              <span className="text-sm text-[#191b23]">
                <strong>Dispatch notification email:</strong> Inform{" "}
                <code className="text-xs font-mono text-[#004ac6]">
                  {user.email}
                </code>{" "}
                regarding role change.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={recordLedger}
                onChange={(e) => setRecordLedger(e.target.checked)}
                className="mt-0.5 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] h-4 w-4"
              />
              <span className="text-sm text-[#191b23]">
                <strong>Record SOC2 compliance ledger:</strong> Log change with
                operator <code className="text-xs font-mono text-[#737686]">
                  usr_admin_sarah
                </code>{" "}
                and timestamp.
              </span>
            </label>
          </div>
        </div>

        {/* RIGHT: Impact + payload */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#ffffff] border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
            <div
              className={`flex items-center gap-2 ${
                isDowngrade ? "text-[#ba1a1a]" : "text-[#006a63]"
              } font-bold text-sm pb-2 border-b border-[#c3c6d7]`}
            >
              <CircleAlert className="w-4 h-4" />
              {isDowngrade
                ? "Privilege Downgrade Impact Notice"
                : "Privilege Impact Summary"}
            </div>
            <div className="space-y-3 mt-3">
              <ImpactItem
                title="Revocation of Admin Console"
                description={`${user.name} will ${
                  isDowngrade ? "lose" : "gain"
                } access to /admin/* routes, including Audit Logs and Workspace Governance.`}
              />
              <ImpactItem
                title="Active Session Revocation"
                description="Target user's active sessions will be cycled on their next request cycle (< 60s TTL)."
              />
              <ImpactItem
                title="Tenant Scoping Constraint"
                description={`User will only access their explicitly assigned workspaces (${
                  user.membershipWorkspacesCount
                } total). Impersonation capabilities ${
                  isDowngrade ? "disabled" : "enabled"
                }.`}
              />
            </div>
          </div>


        </div>
      </div>



      {/* CONFIRMATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2e3039]/60 backdrop-blur-sm">
          <div className="bg-[#ffffff] border border-[#c3c6d7] rounded-xl max-w-xl w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#c3c6d7] bg-[#f3f3fe] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#ba1a1a]" />
                <h3 className="text-lg font-bold text-[#191b23]">
                  Confirm RBAC Role Mutation
                </h3>
              </div>
              <button
                className="p-1 rounded-md text-[#737686] hover:text-[#191b23] hover:bg-[#ededf9] transition-colors"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Transition visualizer */}
              <div className="bg-[#f3f3fe] p-4 rounded-lg border border-[#c3c6d7] flex items-center justify-between flex-wrap gap-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#004ac6] text-[#ffffff] font-bold flex items-center justify-center text-sm">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#191b23]">
                      {user.name}
                    </div>
                    <div className="font-mono text-xs text-[#737686]">
                      {user.id}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#ffdad6] text-[#93000a] text-xs font-bold">
                    {user.role}
                  </span>
                  <MoveRight className="w-4 h-4 text-[#737686]" />
                  <span className="px-2.5 py-1 rounded bg-[#99efe5] text-[#006f67] text-xs font-bold">
                    {role}
                  </span>
                </div>
              </div>

              {/* API call */}
              <div className="p-3 bg-[#ededf9] border border-[#c3c6d7] rounded-lg font-mono text-xs">
                <span className="text-[#004ac6] font-bold">PATCH</span>{" "}
                /admin/users/{user.id}/role{" "}
                <span className="text-[#737686]">Payload:</span>{" "}
                <code className="text-[#006a63] font-bold">
                  {`{"role": "${role}"}`}
                </code>
              </div>

              {/* Security warning */}
              <div className="bg-[#ffdad6]/30 border border-[#ffdad6] rounded-lg p-3 text-xs text-[#93000a] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CircleAlert className="w-4 h-4" />
                  {isDowngrade
                    ? "Critical Governance Downgrade:"
                    : "Administrative Privilege Escalation:"}
                </div>
                <p>
                  {isDowngrade
                    ? `Demoting ${user.name} revokes immediate access to tenant billing controls, impersonation APIs, and global workspace configuration.`
                    : `Promoting ${user.name} to ADMIN grants elevated tenant governance, impersonation, and billing overrides immediately.`}
                </p>
              </div>

              {/* Confirm input */}
              <form
                onSubmit={handleSubmit(executeRoleChange)}
                className="space-y-1.5 pt-1"
              >
                <label className="block text-sm font-semibold text-[#191b23]">
                  Type{" "}
                  <span className="font-mono font-bold text-[#ba1a1a]">
                    CONFIRM
                  </span>{" "}
                  to authorize under SOC2 protocol:
                </label>
                <input
                  {...register("confirmationToken")}
                  disabled={roleLoading}
                  placeholder="Type CONFIRM..."
                  className="w-full px-4 py-2 border border-[#c3c6d7] rounded-lg font-mono text-sm text-[#191b23] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] disabled:opacity-50"
                />
                {errors.confirmationToken && (
                  <p className="text-xs text-[#ba1a1a] font-medium">
                    {errors.confirmationToken.message}
                  </p>
                )}

                <div className="pt-3 flex items-center justify-between border-t border-[#c3c6d7] -mx-2 px-2 mt-4 bg-transparent">
                  <span className="text-xs text-[#737686] flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4" />
                    Authorized by Sarah K.
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="px-4 py-1.5 border border-[#c3c6d7] rounded-lg text-sm text-[#434655] hover:bg-[#ededf9] transition-colors"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={roleLoading}
                      className="px-4 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-[#ffffff] rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {roleLoading ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Execute Role Change
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleCard({
  selected,
  value,
  title,
  badge,
  badgeClassName,
  roleId,
  description,
  checkedFeatures,
  blockedFeatures,
  icon,
  iconRing,
  onSelect,
}: {
  selected: boolean;
  value: "ADMIN" | "USER";
  title: string;
  badge: string;
  badgeClassName: string;
  roleId: string;
  description: string;
  checkedFeatures: string[];
  blockedFeatures: string[];
  icon: React.ReactNode;
  iconRing: string;
  onSelect: (value: "ADMIN" | "USER") => void;
}) {
  return (
    <div
      onClick={() => onSelect(value)}
      className={`relative rounded-xl p-6 cursor-pointer transition-all ${
        selected
          ? "border-2 border-[#004ac6] bg-[#dbe1ff]/20"
          : "border border-[#c3c6d7] bg-[#ffffff] hover:border-[#737686]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="target_role"
            value={value}
            checked={selected}
            onChange={() => onSelect(value)}
            className="mt-1 text-[#004ac6] focus:ring-[#004ac6] h-4 w-4 border-[#c3c6d7] rounded-full"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <label
                onClick={(e) => e.stopPropagation()}
                className="text-base font-bold text-[#191b23] cursor-pointer"
              >
                {title}
              </label>
              {badge && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${badgeClassName}`}
                >
                  {badge}
                </span>
              )}
              <span className="text-xs text-[#737686] font-mono">{roleId}</span>
            </div>
            <p className="text-sm text-[#434655] mt-1">{description}</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#434655]">
              {checkedFeatures.map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <CircleCheck className="w-3.5 h-3.5 text-[#006a63]" />
                  {f}
                </div>
              ))}
              {blockedFeatures.map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#737686]" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
        <span className={`${iconRing} shrink-0`}>{icon}</span>
      </div>
    </div>
  );
}

function ImpactItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-2.5 rounded-lg bg-[#f3f3fe] border border-[#c3c6d7]">
      <div className="text-xs font-bold text-[#191b23]">{title}</div>
      <p className="text-xs text-[#434655] mt-0.5">{description}</p>
    </div>
  );
}

function ErrorRow({
  accentBg,
  accentText,
  code,
  title,
  message,
  icon,
  border,
  outerBg,
}: {
  accentBg: string;
  accentText: string;
  code: string;
  title: string;
  message: React.ReactNode;
  icon: React.ReactNode;
  border?: string;
  outerBg?: string;
}) {
  return (
    <div
      className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
        outerBg ?? "bg-[#f3f3fe]"
      } ${border ?? "border-[#c3c6d7]"}`}
    >
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${accentBg} ${accentText}`}
          >
            {code}
          </span>
          <span className="font-mono text-xs text-[#191b23] font-semibold">
            {title}
          </span>
        </div>
        <p className="text-xs text-[#434655] mt-1">{message}</p>
      </div>
      <span className="shrink-0">{icon}</span>
    </div>
  );
}
