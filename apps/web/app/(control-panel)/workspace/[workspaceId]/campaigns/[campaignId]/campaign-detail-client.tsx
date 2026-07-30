"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft, Edit, PauseCircle, Trash2, Info, Calendar, History, User,
  Globe, Send, Clock, TimerOff, CalendarPlus, ShieldCheck, Copy,
  TrendingUp, Zap, Play, Mail,
} from "lucide-react";
import { useNotification } from "@repo/ui/notification-provider";
import type { CampaignDetail } from "../../../../../src/actions/workspace/get-campaign";
import { updateCampaignStatus } from "../../../../../src/actions/workspace/update-campaign-status";
import { deleteCampaign } from "../../../../../src/actions/workspace/delete-campaign";
import { updateCampaign } from "../../../../../src/actions/workspace/update-campaign";
import type { UpdateCampaignData } from "../../../../../src/actions/workspace/update-campaign";

type Props = {
  workspaceId: string;
  campaign: CampaignDetail;
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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

function formatFull(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return d; }
}

function formatTime(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return d; }
}

export function CampaignDetailClient({ workspaceId, campaign: initialCampaign }: Props) {
  const { notify } = useNotification();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<CampaignDetail>(initialCampaign);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<UpdateCampaignData>({});
  const [saving, setSaving] = useState(false);

  const sc = statusStyles[campaign.status] ?? statusStyles.PENDING;

  async function handleCopy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify({ title: "Copied", message: `${label} copied to clipboard.`, tone: "success" });
    } catch {
      notify({ title: "Copy failed", message: "Could not copy to clipboard.", tone: "error" });
    }
  }

  async function handleStatusUpdate(newStatus: "DRAFT" | "SCHEDULED" | "PAUSED" | "CANCELLED") {
    const label = newStatus === "PAUSED" ? "paused" : newStatus === "CANCELLED" ? "cancelled" : newStatus === "DRAFT" ? "moved to draft" : newStatus.toLowerCase();
    setActionLoading(label);
    try {
      const result = await updateCampaignStatus(workspaceId, campaign.id, newStatus);
      if (result.status === "error") {
        notify({ title: "Failed", message: result.message, tone: "error" });
        return;
      }
      setCampaign({ ...campaign, ...result.data });
      notify({ title: `Campaign ${label}`, message: `The campaign has been ${label}.`, tone: "success" });
    } catch {
      notify({ title: "Failed", message: "Something went wrong.", tone: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePause() {
    await handleStatusUpdate("PAUSED");
  }

  async function handleDraftFromPaused() {
    await handleStatusUpdate("DRAFT");
  }

  async function handleSchedule() {
    await handleStatusUpdate("SCHEDULED");
  }

  async function handleDelete() {
    setShowDeleteConfirm(false);
    setActionLoading("delete");
    try {
      const result = await deleteCampaign(workspaceId, campaign.id);
      if (result.status === "error") {
        notify({ title: "Failed", message: result.message, tone: "error" });
        return;
      }
      notify({ title: "Campaign deleted", message: "The campaign has been deleted.", tone: "success" });
      window.location.href = `/workspace/${workspaceId}/campaigns`;
    } catch {
      notify({ title: "Failed", message: "Something went wrong.", tone: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  function handleEditOpen() {
    setEditForm({
      name: campaign.name,
      description: campaign.description,
      timezone: campaign.timezone,
      startAt: campaign.startAt,
      endAt: campaign.endAt,
      dailyLimit: campaign.dailyLimit,
      sendingFromHour: campaign.sendingFromHour,
      sendingToHour: campaign.sendingToHour,
      randomDelayMin: campaign.randomDelayMin,
      followUpEnabled: campaign.followUpEnabled,
      stopOnReply: campaign.stopOnReply,
      stopOnBounce: campaign.stopOnBounce,
      smtpAccountId: campaign.smtpAccountId,
    });
    setShowEditModal(true);
  }

  async function handleEditSave() {
    setSaving(true);
    try {
      const result = await updateCampaign(workspaceId, campaign.id, editForm);
      if (result.status === "error") {
        notify({ title: "Update failed", message: result.message, tone: "error" });
        return;
      }
      setCampaign({ ...campaign, ...result.data });
      setShowEditModal(false);
      notify({ title: "Campaign updated", message: "Changes saved successfully.", tone: "success" });
    } catch {
      notify({ title: "Update failed", message: "Something went wrong.", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  const createdDisplay = formatFull(campaign.createdAt) ?? "—";
  const updatedDisplay = formatDate(campaign.updatedAt) ?? "—";
  const ownerName = campaign.createdBy?.name ?? "Unknown";
  const nextRunDisplay = campaign.nextRunAt ? formatTime(campaign.nextRunAt) : "Not scheduled";

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="p-[32px] space-y-[24px] max-w-[1440px] mx-auto w-full">
        {/* Breadcrumbs & Header Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px]">
          <div className="space-y-[8px]">
            <Link
              href={`/workspace/${workspaceId}/campaigns`}
              className="flex items-center gap-[8px] text-[#004ac6] font-semibold text-[12px] leading-[16px] uppercase tracking-wider hover:underline"
            >
              <ArrowLeft className="size-[18px]" />
              Back to Campaigns
            </Link>
            <div className="flex items-center gap-[16px]">
              <h2 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">{campaign.name}</h2>
              <span className={`px-[12px] py-[4px] rounded-full text-[12px] leading-[16px] font-bold flex items-center gap-[4px] ${sc}`}>
                {(campaign.status === "PROCESSING" || campaign.status === "RUNNING") && (
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                )}
                {campaign.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <button onClick={handleEditOpen} className="px-[20px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#f3f3fe] transition-colors flex items-center gap-[8px] bg-white" type="button">
              <Edit className="size-[18px]" /> Edit
            </button>
            <Link
              href={`/workspace/${workspaceId}/campaigns/${campaign.id}/emails`}
              className="px-[20px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#f3f3fe] transition-colors flex items-center gap-[8px] bg-white"
            >
              <Mail className="size-[18px]" /> See All Emails
            </Link>
            {campaign.status === "DRAFT" && (
              <button
                className="px-[20px] py-[10px] bg-[#004ac6] text-white rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:opacity-90 transition-opacity flex items-center gap-[8px] disabled:opacity-50"
                type="button"
                disabled={actionLoading === "scheduled"}
                onClick={handleSchedule}
              >
                <CalendarPlus className="size-[18px]" /> {actionLoading === "scheduled" ? "Scheduling..." : "Schedule"}
              </button>
            )}
            {campaign.status === "PAUSED" && (
              <button
                className="px-[20px] py-[10px] bg-[#191b23] text-white rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:opacity-90 transition-opacity flex items-center gap-[8px] disabled:opacity-50"
                type="button"
                disabled={actionLoading === "draft"}
                onClick={handleDraftFromPaused}
              >
                <Play className="size-[18px]" /> {actionLoading === "draft" ? "Moving to Draft..." : "Back to Draft"}
              </button>
            )}
            {["RUNNING", "SCHEDULED", "QUEUED"].includes(campaign.status) && (
              <button
                className="px-[20px] py-[10px] bg-[#191b23] text-white rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:opacity-90 transition-opacity flex items-center gap-[8px] disabled:opacity-50"
                type="button"
                disabled={actionLoading === "pause"}
                onClick={handlePause}
              >
                <PauseCircle className="size-[18px]" /> {actionLoading === "pause" ? "Pausing..." : "Pause Campaign"}
              </button>
            )}
            {campaign.status === "DRAFT" && (
              <button
                className="px-[20px] py-[10px] text-[#ba1a1a] border border-[#ba1a1a]/40 rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:bg-[#ffdad6] transition-colors flex items-center gap-[8px] bg-white disabled:opacity-50"
                type="button"
                disabled={actionLoading === "delete"}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="size-[18px]" /> {actionLoading === "delete" ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-[24px]">
          {/* Campaign Overview Card */}
          <section className="col-span-12 lg:col-span-8 bg-white/70 backdrop-blur-[8px] border border-[#c3c6d7]/30 rounded-xl p-[24px] flex flex-col justify-between">
            <div className="space-y-[16px]">
              <div className="flex items-center justify-between">
                <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Campaign Overview</h3>
                <Info className="size-5 text-[#737686]" />
              </div>
              <p className="text-[18px] leading-[28px] text-[#434655]">
                {campaign.description ?? "No description provided."}
              </p>
            </div>
            <div className="mt-[24px] flex items-center gap-[24px] border-t border-[#c3c6d7] pt-[16px]">
              <div className="flex items-center gap-[8px]">
                <Calendar className="size-5 text-[#004ac6]" />
                <div>
                  <p className="text-[12px] leading-[16px] text-[#737686] uppercase font-bold tracking-[0.05em]">Created</p>
                  <p className="text-[16px] leading-[24px] text-[#191b23]">{createdDisplay}</p>
                </div>
              </div>
              <div className="flex items-center gap-[8px]">
                <History className="size-5 text-[#004ac6]" />
                <div>
                  <p className="text-[12px] leading-[16px] text-[#737686] uppercase font-bold tracking-[0.05em]">Last Updated</p>
                  <p className="text-[16px] leading-[24px] text-[#191b23]">{updatedDisplay}</p>
                </div>
              </div>
              <div className="flex items-center gap-[8px]">
                <User className="size-5 text-[#004ac6]" />
                <div>
                  <p className="text-[12px] leading-[16px] text-[#737686] uppercase font-bold tracking-[0.05em]">Owner</p>
                  <p className="text-[16px] leading-[24px] text-[#191b23]">{ownerName}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sending Rules Card */}
          <section className="col-span-12 lg:col-span-4 bg-[#e7e7f3] rounded-xl p-[24px] space-y-[16px] border border-[#c3c6d7]">
            <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Sending Rules</h3>
            <div className="space-y-[16px]">
              <div className="flex justify-between items-center p-[12px] bg-white/80 rounded-xl border border-[#c3c6d7]">
                <div className="flex items-center gap-[12px]">
                  <Globe className="size-5 text-[#004ac6]" />
                  <span className="text-[14px] leading-[20px] font-medium tracking-[0.05em] text-[#434655]">Timezone</span>
                </div>
                <span className="text-[14px] leading-[20px] font-bold text-[#191b23]">{campaign.timezone}</span>
              </div>
              <div className="flex justify-between items-center p-[12px] bg-white/80 rounded-xl border border-[#c3c6d7]">
                <div className="flex items-center gap-[12px]">
                  <Send className="size-5 text-[#004ac6]" />
                  <span className="text-[14px] leading-[20px] font-medium tracking-[0.05em] text-[#434655]">Daily Limit</span>
                </div>
                <span className="text-[14px] leading-[20px] font-bold text-[#191b23]">{campaign.dailyLimit} emails</span>
              </div>
              <div className="flex justify-between items-center p-[12px] bg-white/80 rounded-xl border border-[#c3c6d7]">
                <div className="flex items-center gap-[12px]">
                  <Clock className="size-5 text-[#004ac6]" />
                  <span className="text-[14px] leading-[20px] font-medium tracking-[0.05em] text-[#434655]">Active Window</span>
                </div>
                <span className="text-[14px] leading-[20px] font-bold text-[#004ac6]">
                  {campaign.sendingFromHour != null && campaign.sendingToHour != null
                    ? `${String(campaign.sendingFromHour).padStart(2, "0")}:00 - ${String(campaign.sendingToHour).padStart(2, "0")}:00`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center p-[12px] bg-white/80 rounded-xl border border-[#c3c6d7]">
                <div className="flex items-center gap-[12px]">
                  <TimerOff className="size-5 text-[#004ac6]" />
                  <span className="text-[14px] leading-[20px] font-medium tracking-[0.05em] text-[#434655]">Random Delay</span>
                </div>
                <span className="text-[14px] leading-[20px] font-bold text-[#191b23]">
                  {campaign.randomDelayMin != null ? `Min: ${campaign.randomDelayMin} mins` : "—"}
                </span>
              </div>
              {campaign.nextRunAt && (
                <div className="flex justify-between items-center p-[12px] bg-[#dbe1ff]/50 border border-[#004ac6]/20 rounded-xl">
                  <div className="flex items-center gap-[12px]">
                    <CalendarPlus className="size-5 text-[#004ac6]" />
                    <span className="text-[14px] leading-[20px] font-medium tracking-[0.05em] text-[#004ac6]">Next Run At</span>
                  </div>
                  <span className="text-[14px] leading-[20px] font-bold text-[#004ac6]">{nextRunDisplay}</span>
                </div>
              )}
            </div>
          </section>

          {/* Safety & Compliance Panel */}
          <section className="col-span-12 md:col-span-6 lg:col-span-4 bg-white/70 backdrop-blur-[8px] border border-[#c3c6d7]/30 rounded-xl p-[24px] space-y-[16px]">
            <div className="flex items-center gap-[8px] text-[#191b23]">
              <ShieldCheck className="size-5 text-[#006a63]" />
              <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em]">Safety & Compliance</h3>
            </div>
            <div className="space-y-[16px] pt-[8px]">
              <div className="flex items-center justify-between">
                <div className="space-y-[2px]">
                  <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">Follow-up Enabled</p>
                  <p className="text-[12px] leading-[16px] text-[#737686]">Automated sequence progression</p>
                </div>
                <Toggle checked={campaign.followUpEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-[2px]">
                  <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">Stop on Reply</p>
                  <p className="text-[12px] leading-[16px] text-[#737686]">Halts flow upon prospect engagement</p>
                </div>
                <Toggle checked={campaign.stopOnReply} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-[2px]">
                  <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">Stop on Bounce</p>
                  <p className="text-[12px] leading-[16px] text-[#737686]">Protects sender reputation metrics</p>
                </div>
                <Toggle checked={campaign.stopOnBounce} />
              </div>
            </div>
          </section>

          {/* Connection Info Card */}
          <section className="col-span-12 md:col-span-6 lg:col-span-8 bg-[#f3f3fe] rounded-xl p-[24px] border border-[#c3c6d7] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-[8px]">
                <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Technical Connection</h3>
                <p className="text-[14px] leading-[20px] text-[#434655] max-w-lg">Advanced routing parameters and background job associations for this specific campaign instance.</p>
              </div>
              <div className="px-[12px] py-[6px] bg-[#e1e2ed] rounded-xl text-[12px] leading-[16px] font-mono font-semibold border border-[#c3c6d7]">
                STABLE_V2.4
              </div>
            </div>
            <div className="mt-[16px] grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div className="p-[12px] bg-white/80 rounded-xl border border-[#c3c6d7] space-y-[4px]">
                <p className="text-[12px] leading-[16px] text-[#737686] uppercase font-bold tracking-[0.05em]">SMTP Account ID</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[14px] leading-[20px] text-[#004ac6] font-bold">{campaign.smtpAccountId ? campaign.smtpAccountId.slice(0, 24) + "..." : "—"}</p>
                  <button className="text-[#004ac6] hover:text-[#0053db] transition-colors" type="button" onClick={() => handleCopy(campaign.smtpAccountId ?? "", "SMTP Account ID")}>
                    <Copy className="size-[18px]" />
                  </button>
                </div>
              </div>
              <div className="p-[12px] bg-white/80 rounded-xl border border-[#c3c6d7] space-y-[4px]">
                <p className="text-[12px] leading-[16px] text-[#737686] uppercase font-bold tracking-[0.05em]">Campaign ID</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[14px] leading-[20px] text-[#191b23] font-bold">{campaign.id.slice(0, 24)}...</p>
                  <button className="text-[#004ac6] hover:text-[#0053db] transition-colors" type="button" onClick={() => handleCopy(campaign.id, "Campaign ID")}>
                    <Copy className="size-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Visual Asset / Atmosphere */}
          <section className="col-span-12 rounded-xl overflow-hidden relative h-64 border border-[#c3c6d7] shadow-lg group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCSiynwk95bPjEUMwkDCXp6k2Jt0zz5_tP1E7RnZyiezqLBLtUse0bSQTCRwfmF0aYT-aJ8UxaxjoXI2geBTpYzECjjvhwAUSflpeSFe5ihiRsQygG59BYvembmkmq7FpXn6PbxcdznNLMmb7EXHgJvQ8KajrqCVJGO74q0c9A-YFT3tA9ImSfdN0A3FwMmG6A3-R_pXqnHIoT_--MDSay_MS4WOn3SYNWJEtxJwBss676j6EzR_9c-dQ')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#191b23]/80 to-transparent flex flex-col justify-center p-[32px]">
              <h4 className="text-white text-[36px] leading-[44px] font-bold tracking-[-0.01em]">Campaign Insights</h4>
              <p className="text-white/80 text-[18px] leading-[28px] max-w-md">Our AI is currently optimizing your outreach patterns based on real-time bounce rates and open timings.</p>
              <Link
                href={`/workspace/${workspaceId}/campaigns`}
                className="mt-[16px] px-[24px] py-[8px] bg-[#004ac6] text-white rounded-xl font-bold w-fit flex items-center gap-[8px] hover:translate-x-2 transition-transform"
              >
                View Performance Data <TrendingUp className="size-5" />
              </Link>
            </div>
          </section>
        </div>

        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-[0_22px_50px_rgb(28_33_67_/_0.18)] p-[28px] max-w-xl w-full mx-4 border border-[#c3c6d7] max-h-[90vh] overflow-y-auto">
              <h3 className="text-[24px] leading-[32px] font-bold text-[#191b23] mb-[24px]">Edit Campaign</h3>
              <div className="space-y-[16px]">
                <div>
                  <label className="block text-[12px] leading-[16px] font-bold tracking-[0.05em] text-[#737686] mb-[4px] uppercase">Name</label>
                  <input
                    className="w-full px-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] text-[#191b23] bg-white"
                    value={editForm.name ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[12px] leading-[16px] font-bold tracking-[0.05em] text-[#737686] mb-[4px] uppercase">Description</label>
                  <textarea
                    className="w-full px-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] text-[#191b23] bg-white resize-none"
                    rows={3}
                    value={editForm.description ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value || null })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[12px] leading-[16px] font-bold tracking-[0.05em] text-[#737686] mb-[4px] uppercase">Timezone</label>
                    <select
                      className="w-full px-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] text-[#191b23] bg-white"
                      value={editForm.timezone ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Chicago">America/Chicago</option>
                      <option value="America/Denver">America/Denver</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Europe/Berlin">Europe/Berlin</option>
                      <option value="Asia/Dubai">Asia/Dubai</option>
                      <option value="Asia/Singapore">Asia/Singapore</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                      <option value="Australia/Sydney">Australia/Sydney</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] leading-[16px] font-bold tracking-[0.05em] text-[#737686] mb-[4px] uppercase">Daily Limit</label>
                    <input
                      type="number" min={1}
                      className="w-full px-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] text-[#191b23] bg-white"
                      value={editForm.dailyLimit ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, dailyLimit: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[12px] leading-[16px] font-bold tracking-[0.05em] text-[#737686] mb-[4px] uppercase">Start At</label>
                    <input
                      type="date"
                      className="w-full px-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] text-[#191b23] bg-white"
                      value={editForm.startAt ? editForm.startAt.slice(0, 10) : ""}
                      onChange={(e) => setEditForm({ ...editForm, startAt: e.target.value ? e.target.value + "T00:00:00.000Z" : null })}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] leading-[16px] font-bold tracking-[0.05em] text-[#737686] mb-[4px] uppercase">End At</label>
                    <input
                      type="date"
                      className="w-full px-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] text-[#191b23] bg-white"
                      value={editForm.endAt ? editForm.endAt.slice(0, 10) : ""}
                      onChange={(e) => setEditForm({ ...editForm, endAt: e.target.value ? e.target.value + "T00:00:00.000Z" : null })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[12px] leading-[16px] font-bold tracking-[0.05em] text-[#737686] mb-[4px] uppercase">Send From Hour</label>
                    <input
                      type="number" min={0} max={23}
                      className="w-full px-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] text-[#191b23] bg-white"
                      value={editForm.sendingFromHour ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, sendingFromHour: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] leading-[16px] font-bold tracking-[0.05em] text-[#737686] mb-[4px] uppercase">Send To Hour</label>
                    <input
                      type="number" min={0} max={23}
                      className="w-full px-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] text-[#191b23] bg-white"
                      value={editForm.sendingToHour ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, sendingToHour: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] leading-[16px] font-bold tracking-[0.05em] text-[#737686] mb-[4px] uppercase">Random Delay Min (minutes)</label>
                  <input
                    type="number" min={0}
                    className="w-full px-[12px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] text-[#191b23] bg-white"
                    value={editForm.randomDelayMin ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, randomDelayMin: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-[12px] pt-[8px] border-t border-[#c3c6d7]">
                  <h4 className="text-[14px] leading-[20px] font-bold text-[#191b23]">Safety & Compliance</h4>
                  <label className="flex items-center gap-[12px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-[18px] accent-[#004ac6]"
                      checked={editForm.followUpEnabled ?? false}
                      onChange={(e) => setEditForm({ ...editForm, followUpEnabled: e.target.checked })}
                    />
                    <span className="text-[14px] text-[#434655]">Follow-up Enabled</span>
                  </label>
                  <label className="flex items-center gap-[12px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-[18px] accent-[#004ac6]"
                      checked={editForm.stopOnReply ?? false}
                      onChange={(e) => setEditForm({ ...editForm, stopOnReply: e.target.checked })}
                    />
                    <span className="text-[14px] text-[#434655]">Stop on Reply</span>
                  </label>
                  <label className="flex items-center gap-[12px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-[18px] accent-[#004ac6]"
                      checked={editForm.stopOnBounce ?? false}
                      onChange={(e) => setEditForm({ ...editForm, stopOnBounce: e.target.checked })}
                    />
                    <span className="text-[14px] text-[#434655]">Stop on Bounce</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-[12px] mt-[24px] pt-[16px] border-t border-[#c3c6d7]">
                <button
                  className="px-[20px] py-[10px] border border-[#c3c6d7] rounded-xl text-[14px] font-semibold text-[#434655] hover:bg-[#f3f3fe] transition-colors bg-white"
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="px-[20px] py-[10px] bg-[#004ac6] text-white rounded-xl text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  type="button"
                  onClick={handleEditSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-[0_22px_50px_rgb(28_33_67_/_0.18)] p-[24px] max-w-sm w-full mx-4 border border-[#c3c6d7]">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#ba1a1a]/10 text-[#ba1a1a]">
                  <Trash2 className="size-5" />
                </div>
                <div>
                  <p className="text-[16px] font-bold text-[#191b23]">Delete campaign?</p>
                  <p className="text-[14px] text-[#434655]">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 rounded-xl border border-[#c3c6d7] bg-white text-[14px] font-semibold text-[#434655] hover:bg-[#f3f3fe] transition-colors"
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-[#ba1a1a] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                  type="button"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer / System Stats */}
        <footer className="mt-[24px] border-t border-[#c3c6d7] pt-[16px] flex flex-col sm:flex-row justify-between items-center gap-[16px]">
          <div className="flex items-center gap-[16px] text-[12px] leading-[16px] text-[#737686]">
            <div className="flex items-center gap-[4px]">
              <span className="w-2 h-2 rounded-full bg-[#006a63]" />
              API Connected
            </div>
            <div className="h-3 w-[1px] bg-[#c3c6d7]" />
            <p>© 2026 ColdReach AI. All sequences are active.</p>
          </div>
          <div className="flex items-center gap-[16px]">
            <Link className="text-[12px] leading-[16px] font-bold text-[#434655] hover:text-[#004ac6] transition-colors" href="#">Privacy Policy</Link>
            <Link className="text-[12px] leading-[16px] font-bold text-[#434655] hover:text-[#004ac6] transition-colors" href="#">Terms of Service</Link>
            <div className="flex items-center gap-[8px] bg-[#ededf9] px-[12px] py-[4px] rounded-full border border-[#c3c6d7]">
              <Zap className="size-[18px] text-[#737686]" />
              <span className="text-[12px] leading-[16px] font-bold text-[#434655]">System Latency: 42ms</span>
            </div>
          </div>
        </footer>
      </div>


    </div>
  );
}

function Toggle({ checked }: { checked: boolean }) {
  return (
    <div
      className={`w-10 h-6 rounded-full relative cursor-not-allowed transition-colors ${checked ? "bg-[#004ac6]" : "bg-[#c3c6d7]"}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? "right-1" : "left-1"}`}
      />
    </div>
  );
}
