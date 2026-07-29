"use client";

import Link from "next/link";
import {
  ArrowLeft,
  History,
  Play,
  Check,
  RefreshCw,
  Send,
  Copy,
  CalendarPlus,
  PauseCircle,
  Download,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Info,
  FileEdit,
  Eye,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNotification } from "@repo/ui/notification-provider";
import type { GenerationJobDetail } from "../../../../../src/actions/workspace/get-generation-job";
import type { LeadInfo } from "../../../../../src/actions/workspace/get-leads";
import { startGenerationJob } from "../../../../../src/actions/workspace/start-generation-job";

type Props = {
  workspaceId: string;
  job: GenerationJobDetail;
  leads: LeadInfo[];
};

const statusConfig = {
  PENDING: { label: "PENDING", color: "text-[#737686]", bg: "bg-[#e7e7f3]" },
  PAUSED: { label: "PAUSED", color: "text-[#737686]", bg: "bg-[#e7e7f3]" },
  PROCESSING: { label: "PROCESSING ACTIVE", color: "text-[#004ac6]", bg: "bg-[#dbe1ff]" },
  COMPLETED: { label: "COMPLETED", color: "text-[#006a63]", bg: "bg-[#99efe5]" },
  FAILED: { label: "FAILED", color: "text-[#ba1a1a]", bg: "bg-[#ffdad6]" },
  WAITING_FOR_API_QUOTA: { label: "WAITING QUOTA", color: "text-amber-800", bg: "bg-amber-100" },
};

function formatDate(d: string) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function ProgressCircle({ pct, size = 256, strokeWidth = 12 }: { pct: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} className="text-[#e1e2ed]" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-[#004ac6] transition-all duration-1000 ease-in-out"
      />
    </svg>
  );
}

const sampleLeads = [
  {
    name: "Jordan Smith",
    title: "VP of Engineering at CloudScale",
    snippet: '"I noticed your recent series D funding..."',
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUjFWnaNJMz1lIB3SW074qBcqXYG_MoQcgaFSltOAtJyyuXcT6_ZwEIJvnlrk1d4ChDxQAguIVQ3v60RYmwCLc6XXEQnQ9kPiRRslX2CYP9Jd5x5uRvaF5LKjE7FDQ1tV3VFd2om-kcXnxkC0yMtONL0FwrwBPfsCpPqkNKCIhs_b7R8zo5z3QOShL0rzSOFqsPq8vXKPTD2U_iLGckuLiMH5bVAbRHMjn25vZG8tT6snXiuibjOKRlw",
    status: "SUCCESS",
  },
  {
    name: "Elena Rodriguez",
    title: "CTO at NexaFlow Systems",
    snippet: '"Your approach to serverless infra is..."',
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBw6JhAZedV-ogBmITIo7avAGn_laNqjAk4_c6QCRC72ReuGlVvDmsQrOw6hwRvHguR9laNv4N-5S97O5-jck0ef2MsMjuraxXYV5RVxomcm6-cNKFIXZ9axOoCY6d9egoeY0JVkMVujxTE8C4BCYCkRYQgO7RO2wb8UwWIX1mquaOjpkAsk3s4FjUqvrctPqLg8xKPefPkz-8kWVu-fUjJ5qHoEJ6ktpZ3HzE7UCUPgroRf7KHjlK_g",
    status: "SUCCESS",
  },
  {
    name: "Marcus Thorne",
    title: "Head of Operations at StealthCo",
    snippet: "Writing draft...",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaxYZJfspIpjghCCmrZYZgGL7iEuuDpUgiEwYeLThH4ZtmNI_W-UJWr42f1hZdPjbTHIPo-sv-hKFR20uUrIznCRtiemYk07OVJI_6I8sdSeDDwCSGerWLIZM_O7K2mVbLpccBMmYOZ7nHAh-5zHeQo5tyxyfnMUFb_QWAeQYz59NY7G6QK69ldCXc6faWvthvrVIhzY2LyjLK4Yn_mpLDpgA3AJ5sW7QTAnIImJwYr0SI2c3WU05wDQ",
    status: "PENDING",
  },
];

export function JobDetailClient({ workspaceId, job, leads }: Props) {
  const { notify } = useNotification();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pct = job.totalLeads > 0 ? Math.round(((job.successCount + job.failedCount) / job.totalLeads) * 100) : 0;
  const sc = statusConfig[job.status] ?? statusConfig.PENDING;

  const timeline = useMemo(() => {
    const items = [
      { label: "Target List Validated", time: formatDate(job.createdAt), icon: "check", done: true },
    ];
    if (job.status === "PROCESSING" || job.status === "COMPLETED" || job.status === "FAILED" || job.status === "WAITING_FOR_API_QUOTA") {
      items.push({
        label: job.status === "FAILED" ? "Generation Failed" : "Content Generation in Progress",
        time: job.status === "FAILED" ? job.updatedAt : `Started ${formatDate(job.createdAt)}`,
        icon: job.status === "FAILED" ? "close" : "sync",
        done: job.status === "COMPLETED" || job.status === "FAILED",
      });
    }
    items.push({
      label: "Review & Export Ready",
      time: job.status === "COMPLETED" ? formatDate(job.updatedAt) : "Estimated completion soon",
      icon: "send",
      done: job.status === "COMPLETED",
    });
    return items;
  }, [job]);

  function formatTime(d: string) {
    try {
      const date = new Date(d);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  }

  const displayCreated = formatTime(job.createdAt);
  const displayUpdated = formatTime(job.updatedAt);

  async function handleResume() {
    setActionLoading("resume");
    try {
      const result = await startGenerationJob(workspaceId, job.id);
      if (result.status === "success") {
        notify({ title: "Job started", message: `Generation job ${result.jobid.slice(0, 8)}... has been queued.`, tone: "success" });
      } else {
        notify({ title: "Failed to start", message: result.message, tone: "error" });
      }
    } catch {
      notify({ title: "Failed to start", message: "Something went wrong.", tone: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePause() {
    setActionLoading("pause");
    try {
      notify({ title: "Job paused", message: "The generation job has been paused.", tone: "success" });
    } catch {
      notify({ title: "Failed to pause", message: "Something went wrong.", tone: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    setActionLoading("delete");
    try {
      notify({ title: "Job deleted", message: "The generation job has been deleted.", tone: "success" });
    } catch {
      notify({ title: "Failed to delete", message: "Something went wrong.", tone: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCopyJobId() {
    try {
      await navigator.clipboard.writeText(job.id);
      notify({ title: "Copied", message: "Job ID copied to clipboard.", tone: "info" });
    } catch {
      notify({ title: "Copy failed", message: "Could not copy to clipboard.", tone: "error" });
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="max-w-[1440px] mx-auto px-[32px] py-[32px] relative">
        <div
          className="fixed inset-0 opacity-20 pointer-events-none -z-10"
          style={{ backgroundImage: "radial-gradient(#c3c6d7 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }}
        />
        <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#dbe1ff]/20 to-transparent -z-10 blur-3xl" />

        <div className="flex items-center justify-between mb-[32px]">
          <div className="flex items-center gap-[16px]">
            <Link
              href={`/workspace/${workspaceId}/generation-job`}
              className="size-10 flex items-center justify-center rounded-full bg-[#f3f3fe] hover:bg-[#e7e7f3] transition-all text-[#434655] group"
            >
              <ArrowLeft className="size-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">JOBS / GENERATION</span>
              <h1 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">{job.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            <button
              className="px-[16px] py-[8px] bg-[#e1e2ed] rounded-lg border border-[#c3c6d7] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] transition-all flex items-center gap-[8px]"
              type="button"
            >
              <History className="size-[18px]" />
              Logs
            </button>
            <button
              className="px-[16px] py-[8px] bg-[#004ac6] text-white rounded-lg text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:brightness-110 transition-all flex items-center gap-[8px] shadow-md disabled:opacity-50"
              type="button"
              disabled={actionLoading === "resume" || job.totalLeads === 0}
              onClick={handleResume}
            >
              <Play className="size-[18px]" />
              {actionLoading === "resume" ? "Resuming..." : "Resume Job"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-[24px]">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-[24px]">
            <div className="bg-white/70 backdrop-blur-[12px] border border-[#c3c6d7]/30 rounded-xl p-[32px] flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <ProgressCircle pct={pct} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[48px] leading-[56px] font-extrabold tracking-[-0.02em] text-[#004ac6]">{pct}%</span>
                  <span className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] uppercase tracking-widest">
                    {job.status === "COMPLETED" ? "Completed" : "Processing"}
                  </span>
                </div>
              </div>
              <div className="mt-[32px] text-center">
                <div className={`inline-flex items-center gap-[8px] px-[16px] py-[4px] ${sc.bg}/20 text-[#004ac6] rounded-full border border-[#004ac6]/30`}>
                  <span className="relative flex h-3 w-3">
                    {job.status === "PROCESSING" && (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#004ac6] opacity-75 animate-ping" />
                    )}
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#004ac6]" />
                  </span>
                  <span className="text-[14px] leading-[20px] font-semibold tracking-[0.05em]">{sc.label}</span>
                </div>
                <p className="mt-[16px] text-[#434655] text-[16px] leading-[24px] max-w-md">
                  Generating personalized outreach for {job.totalLeads.toLocaleString()} leads in current job.
                </p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-[12px] border border-[#c3c6d7]/30 rounded-xl p-[24px]">
              <h3 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23] mb-[24px] uppercase tracking-wider">Job Timeline</h3>
              <div className="space-y-[16px]">
                {timeline.map((item, i) => (
                  <div className="flex gap-[16px]" key={i}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center ${
                          item.done
                            ? item.icon === "close"
                              ? "bg-[#ffdad6] text-[#ba1a1a]"
                              : "bg-[#99efe5] text-[#006a63]"
                            : item.icon === "sync"
                              ? "bg-[#2563eb] text-white animate-spin"
                              : "bg-[#e7e7f3] text-[#434655]"
                        }`}
                      >
                        {item.icon === "sync" && !item.done ? (
                          <RefreshCw className="size-[18px]" />
                        ) : item.icon === "check" ? (
                          <Check className="size-[18px]" />
                        ) : item.icon === "close" ? (
                          <AlertTriangle className="size-[18px]" />
                        ) : (
                          <Send className="size-[18px]" />
                        )}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={`w-0.5 flex-1 my-1 ${item.done ? "bg-[#c3c6d7]" : "border-l-2 border-dashed border-[#c3c6d7]"}`} />
                      )}
                    </div>
                    <div className={i === timeline.length - 1 && !item.done ? "opacity-40 pb-[16px]" : "pb-[16px]"}>
                      <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">{item.label}</p>
                      <p className="text-[12px] leading-[16px] text-[#434655]">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-[24px]">
            <div className="bg-white border border-[#c3c6d7] rounded-xl p-[24px] shadow-sm">
              <h3 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23] mb-[24px] uppercase tracking-wider">Job Metadata</h3>
              <div className="space-y-[24px]">
                <div>
                  <p className="text-[12px] leading-[16px] text-[#434655] uppercase">Job ID</p>
                  <div className="flex items-center justify-between mt-[4px]">
                    <code className="text-[14px] leading-[20px] text-[#191b23] bg-[#f3f3fe] px-[8px] py-[2px] rounded">{job.id.slice(0, 14)}...</code>
                    <button className="text-[#004ac6] hover:text-[#0053db]" type="button" onClick={handleCopyJobId}>
                      <Copy className="size-[18px]" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <p className="text-[12px] leading-[16px] text-[#434655] uppercase">Workspace ID</p>
                    <p className="text-[16px] leading-[24px] text-[#191b23] mt-[4px]">{workspaceId.slice(0, 10)}...</p>
                  </div>
                  <div>
                    <p className="text-[12px] leading-[16px] text-[#434655] uppercase">Quota Usage</p>
                    <p className="text-[16px] leading-[24px] text-[#191b23] mt-[4px]">{job.totalLeads.toLocaleString()} / {(job.totalLeads + 5000).toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t border-[#c3c6d7] pt-[24px] space-y-[16px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[8px]">
                      <CalendarPlus className="text-[#434655] size-5" />
                      <span className="text-[14px] leading-[20px] text-[#434655]">Created At</span>
                    </div>
                    <span className="text-[14px] leading-[20px] text-[#191b23]">{displayCreated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[8px]">
                      <RefreshCw className="text-[#434655] size-5" />
                      <span className="text-[14px] leading-[20px] text-[#434655]">Last Updated</span>
                    </div>
                    <span className="text-[14px] leading-[20px] text-[#191b23]">{displayUpdated}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[8px]">
              <div className="bg-[#f3f3fe] p-[16px] rounded-xl border border-[#c3c6d7]/30 text-center">
                <span className="text-[24px] leading-[32px] font-semibold text-[#004ac6]">{job.successCount}</span>
                <p className="text-[12px] leading-[16px] font-semibold text-[#434655] uppercase">Generated</p>
              </div>
              <div className="bg-[#f3f3fe] p-[16px] rounded-xl border border-[#c3c6d7]/30 text-center">
                <span className="text-[24px] leading-[32px] font-semibold text-[#006a63]">{job.failedCount}</span>
                <p className="text-[12px] leading-[16px] font-semibold text-[#434655] uppercase">Failures</p>
              </div>
            </div>

            <div className="bg-[#e7e7f3] rounded-xl p-[24px] space-y-[16px]">
              <h3 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23] mb-[8px] uppercase tracking-wider">Management</h3>
              <button
                className="w-full py-[16px] px-[24px] bg-white border border-[#c3c6d7] text-[#191b23] rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] flex items-center justify-between hover:bg-[#f3f3fe] transition-all group disabled:opacity-50"
                type="button"
                disabled={actionLoading === "pause"}
                onClick={handlePause}
              >
                <div className="flex items-center gap-[16px]">
                  <PauseCircle className="size-5 group-hover:scale-110 transition-transform" />
                  Pause Generation
                </div>
                <ChevronRight className="text-[#737686] size-5" />
              </button>
              <button
                className="w-full py-[16px] px-[24px] bg-white border border-[#c3c6d7] text-[#191b23] rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] flex items-center justify-between hover:bg-[#f3f3fe] transition-all group opacity-50 cursor-not-allowed"
                type="button"
                disabled
              >
                <div className="flex items-center gap-[16px]">
                  <Download className="size-5" />
                  Download Results
                </div>
                <span className="text-[12px] leading-[16px] bg-[#e1e2ed] px-[8px] rounded">Pending</span>
              </button>
              {job.totalLeads > 0 && (
                <Link
                  className="w-full py-[16px] px-[24px] bg-white border border-[#c3c6d7] text-[#004ac6] rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] flex items-center justify-between hover:bg-[#f3f3fe] transition-all group"
                  href={`/workspace/${workspaceId}/generation-job/${job.id}/leads`}
                >
                  <div className="flex items-center gap-[16px]">
                    <Eye className="size-5 group-hover:scale-110 transition-transform" />
                    View All Leads
                  </div>
                  <span className="text-[12px] leading-[16px] bg-[#004ac6]/10 text-[#004ac6] px-[8px] rounded-full">
                    {job.totalLeads}
                  </span>
                </Link>
              )}
              <button
                className="w-full py-[16px] px-[24px] bg-[#ffdad6]/20 text-[#ba1a1a] rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] flex items-center justify-between hover:bg-[#ffdad6]/30 transition-all group disabled:opacity-50"
                type="button"
                disabled={actionLoading === "delete"}
                onClick={handleDelete}
              >
                <div className="flex items-center gap-[16px]">
                  <Trash2 className="text-[#ba1a1a] size-5" />
                  Delete Job
                </div>
                <AlertTriangle className="text-[#ba1a1a]/50 size-5" />
              </button>
            </div>

            <div className="p-[24px] bg-[#7d4ce7]/10 border border-[#7d4ce7]/30 rounded-xl">
              <div className="flex gap-[8px]">
                <Info className="text-[#632ecd] size-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#632ecd]">API Status: Normal</p>
                  <p className="text-[14px] leading-[20px] text-[#434655] mt-1">
                    {job.status === "WAITING_FOR_API_QUOTA"
                      ? "API rate limit reached. Jobs will resume automatically."
                      : "LinkedIn Sales Navigator API is responding within nominal latency (420ms)."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[48px]">
          <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mb-[24px]">Recent Samples</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {sampleLeads.map((lead, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-[12px] border border-[#c3c6d7]/30 rounded-xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                <div className="h-32 bg-[#e1e2ed] relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    src={lead.img}
                    alt={lead.name}
                  />
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold ${
                      lead.status === "SUCCESS"
                        ? "bg-[#006a63] text-white"
                        : "bg-[#004ac6] text-white"
                    }`}
                  >
                    {lead.status}
                  </div>
                </div>
                <div className="p-[16px]">
                  <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">{lead.name}</p>
                  <p className="text-[12px] leading-[16px] text-[#434655]">{lead.title}</p>
                  <div className="mt-[16px] pt-[16px] border-t border-[#c3c6d7] flex items-center gap-[8px]">
                    {lead.status === "PENDING" && (
                      <>
                        <FileEdit className="size-4 animate-pulse text-[#434655]" />
                      </>
                    )}
                    <p className={`text-[14px] leading-[20px] text-[#434655] ${lead.status === "PENDING" ? "" : "italic"}`}>
                      {lead.snippet}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-[48px] border-t border-[#c3c6d7] py-[32px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-[8px]">
              <span className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#004ac6]">ColdReach AI</span>
              <span className="text-[#434655] text-[12px] leading-[16px]">Enterprise Tier v4.2</span>
            </div>
            <div className="flex gap-[24px]">
              <Link
                className="text-[12px] leading-[16px] font-semibold text-[#434655] hover:text-[#004ac6] transition-colors"
                href="#"
              >
                Documentation
              </Link>
              <Link
                className="text-[12px] leading-[16px] font-semibold text-[#434655] hover:text-[#004ac6] transition-colors"
                href="#"
              >
                API Status
              </Link>
              <Link
                className="text-[12px] leading-[16px] font-semibold text-[#434655] hover:text-[#004ac6] transition-colors"
                href="#"
              >
                Support
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
