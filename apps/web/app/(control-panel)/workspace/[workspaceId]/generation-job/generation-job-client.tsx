"use client";

import { ArrowLeft, Plus, Search, CheckCircle, AlertCircle, Clock, RefreshCw, X, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createGenerationJob } from "../../../../src/actions/workspace/create-generation-job";
import { updateGenerationJob } from "../../../../src/actions/workspace/update-generation-job";
import { deleteGenerationJob } from "../../../../src/actions/workspace/delete-generation-job";
import type { GenerationJobInfo } from "../../../../src/actions/workspace/workspace-info";
import { useNotification } from "@repo/ui/notification-provider";

type Props = {
  workspaceId: string;
  jobs: GenerationJobInfo[];
  jobCount: number;
};

const statusStyles: Record<string, { label: string; container: string; Icon: typeof CheckCircle }> = {
  COMPLETED: { label: "COMPLETED", container: "bg-[#99efe5] text-[#006a63]", Icon: CheckCircle },
  PROCESSING: { label: "PROCESSING", container: "bg-[#dbe1ff] text-[#003ea8]", Icon: RefreshCw },
  FAILED: { label: "FAILED", container: "bg-[#ffdad6] text-[#ba1a1a]", Icon: AlertCircle },
  WAITING_FOR_API_QUOTA: { label: "WAITING QUOTA", container: "bg-amber-100 text-amber-800", Icon: Clock },
  PENDING: { label: "PENDING", container: "bg-[#e7e7f3] text-[#434655]", Icon: Clock },
  PAUSED: { label: "PAUSED", container: "bg-[#e7e7f3] text-[#434655]", Icon: Clock },
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "N/A";
  }
}

export function GenerationJobClient({ workspaceId, jobs, jobCount }: Props) {
  const router = useRouter();
  const { notify } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingJob, setEditingJob] = useState<GenerationJobInfo | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<GenerationJobInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const processing = jobs.filter((j) => j.status === "PROCESSING").length;
  const failed = jobs.filter((j) => j.status === "FAILED" || j.status === "WAITING_FOR_API_QUOTA").length;
  const totalSuccess = jobs.reduce((s, j) => s + j.successCount, 0);
  const totalLeads = jobs.reduce((s, j) => s + j.totalLeads, 0);
  const successRate = totalLeads > 0 ? Math.round((totalSuccess / totalLeads) * 100) : 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await createGenerationJob(workspaceId, new FormData(e.currentTarget));
    setSubmitting(false);
    if (result.status === "error") {
      setError(result.message);
    } else {
      setShowModal(false);
      router.refresh();
    }
  }

  async function handleRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingJob) return;
    const form = e.currentTarget;
    const name = new FormData(form).get("name");
    if (typeof name !== "string") return;
    setRenameError("");
    setRenaming(true);
    const result = await updateGenerationJob(workspaceId, editingJob.id, name);
    setRenaming(false);
    if (result.status === "error") {
      setRenameError(result.message);
    } else {
      setEditingJob(null);
      notify({ title: "Job renamed", message: `Renamed to "${result.job.name}"`, tone: "success" });
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const result = await deleteGenerationJob(workspaceId, pendingDelete.id);
    setDeleting(false);
    if (result.status === "error") {
      setPendingDelete(null);
      notify({ title: "Couldn't delete job", message: result.message, tone: "error" });
    } else {
      setPendingDelete(null);
      notify({ title: "Job deleted", tone: "success" });
      router.refresh();
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto p-[32px] space-y-[24px] custom-scrollbar">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!submitting) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d7]">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#191b23]">Create Generation Job</h2>
                <p className="text-[13px] text-[#434655] mt-1">Name your new automated outreach job.</p>
              </div>
              <button className="p-2 hover:bg-[#ededf9] rounded-lg transition-colors text-[#434655]" onClick={() => setShowModal(false)} disabled={submitting}><X className="size-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="name">Job Name</label>
                <input id="name" name="name" type="text" required minLength={2} placeholder="e.g. Q4 Enterprise Prospecting" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
              </div>
              {error && <div className="bg-[#ffdad6] text-[#ba1a1a] text-[13px] leading-[18px] px-4 py-3 rounded-lg font-medium">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="px-5 py-2.5 text-[13px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] rounded-lg transition-colors" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" disabled={submitting} className="bg-[#004ac6] text-white text-[13px] font-semibold tracking-[0.05em] px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                  {submitting ? "Creating..." : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!renaming) setEditingJob(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d7]">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#191b23]">Rename Job</h2>
                <p className="text-[13px] text-[#434655] mt-1">Update the name of this generation job.</p>
              </div>
              <button className="p-2 hover:bg-[#ededf9] rounded-lg transition-colors text-[#434655]" onClick={() => setEditingJob(null)} disabled={renaming}><X className="size-5" /></button>
            </div>
            <form onSubmit={handleRename} className="p-6 space-y-5">
              <div>
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="rename-name">Job Name</label>
                <input id="rename-name" name="name" type="text" required minLength={2} defaultValue={editingJob.name} className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
              </div>
              {renameError && <div className="bg-[#ffdad6] text-[#ba1a1a] text-[13px] leading-[18px] px-4 py-3 rounded-lg font-medium">{renameError}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="px-5 py-2.5 text-[13px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] rounded-lg transition-colors" onClick={() => setEditingJob(null)} disabled={renaming}>Cancel</button>
                <button type="submit" disabled={renaming} className="bg-[#004ac6] text-white text-[13px] font-semibold tracking-[0.05em] px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                  {renaming ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!deleting) setPendingDelete(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d7]">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#191b23]">Delete Generation Job</h2>
                <p className="text-[13px] text-[#434655] mt-1">This action cannot be undone.</p>
              </div>
              <button className="p-2 hover:bg-[#ededf9] rounded-lg transition-colors text-[#434655]" onClick={() => setPendingDelete(null)} disabled={deleting}><X className="size-5" /></button>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] shrink-0">
                  <Trash2 className="size-6" />
                </div>
                <div>
                  <p className="text-[14px] leading-[20px] text-[#191b23]">Delete <span className="font-semibold">{pendingDelete.name}</span> and all its leads?</p>
                  <p className="text-[13px] leading-[18px] text-[#434655] mt-1">This permanently removes the job and its generated leads.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#c3c6d7]">
              <button type="button" className="px-5 py-2.5 text-[13px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] rounded-lg transition-colors" onClick={() => setPendingDelete(null)} disabled={deleting}>Cancel</button>
              <button type="button" disabled={deleting} onClick={handleDelete} className="bg-[#ba1a1a] text-white text-[13px] font-semibold tracking-[0.05em] px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-[24px]">
        <div className="flex items-center gap-[16px]">
          <Link href={`/workspace/${workspaceId}`} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#c3c6d7] hover:bg-[#ededf9] transition-colors">
            <ArrowLeft className="size-5 text-[#434655]" />
          </Link>
          <div>
            <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">Generation Jobs</h1>
            <p className="text-[16px] leading-[24px] text-[#434655] max-w-2xl">Monitor and manage your automated outreach workflows. View real-time status and efficiency metrics across all campaigns.</p>
          </div>
        </div>
        <div className="flex gap-[8px]">
          <button className="px-[16px] py-[8px] bg-[#e7e7f3] text-[#434655] text-[14px] leading-[20px] font-semibold tracking-[0.05em] rounded-lg flex items-center gap-[4px] hover:bg-[#e1e2ed] transition-colors" type="button">
            <Search className="size-4" />
            Filter
          </button>
          <button className="px-[16px] py-[8px] bg-[#004ac6] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em] rounded-lg flex items-center gap-[4px] hover:opacity-90 active:scale-95 transition-all" type="button" onClick={() => setShowModal(true)}>
            <Plus className="size-4" />
            New Job
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        <div className="bg-white/80 backdrop-blur-[12px] border border-[#e1e2ed] p-[24px] rounded-xl shadow-sm">
          <div className="flex items-start justify-between mb-[16px]">
            <span className="p-[8px] bg-[#dbe1ff] text-[#003ea8] rounded-lg"><Search className="size-5" /></span>
            <span className="text-[12px] leading-[16px] font-semibold text-[#006a63] bg-[#99efe5] px-[8px] py-[4px] rounded-full">+12%</span>
          </div>
          <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Total Jobs</p>
          <h3 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em]">{jobCount}</h3>
        </div>

        <div className="bg-white/80 backdrop-blur-[12px] border border-[#e1e2ed] p-[24px] rounded-xl shadow-sm border-l-4 border-[#004ac6]">
          <div className="flex items-start justify-between mb-[16px]">
            <span className="p-[8px] bg-blue-100 text-[#2563eb] rounded-lg"><RefreshCw className="size-5 animate-spin" /></span>
          </div>
          <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Processing</p>
          <h3 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em]">{processing}</h3>
        </div>

        <div className="bg-white/80 backdrop-blur-[12px] border border-[#e1e2ed] p-[24px] rounded-xl shadow-sm">
          <div className="flex items-start justify-between mb-[16px]">
            <span className="p-[8px] bg-[#99efe5] text-[#006a63] rounded-lg"><CheckCircle className="size-5" /></span>
          </div>
          <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Success Rate</p>
          <h3 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em]">{successRate}%</h3>
        </div>

        <div className="bg-white/80 backdrop-blur-[12px] border border-[#e1e2ed] p-[24px] rounded-xl shadow-sm border-l-4 border-[#ba1a1a]">
          <div className="flex items-start justify-between mb-[16px]">
            <span className="p-[8px] bg-[#ffdad6] text-[#ba1a1a] rounded-lg"><AlertCircle className="size-5" /></span>
          </div>
          <p className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Failed / Waiting</p>
          <h3 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em]">{failed}</h3>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-[12px] border border-[#c3c6d7] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f3fe] border-b border-[#c3c6d7]">
                <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Job Name</th>
                <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Status</th>
                <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Leads</th>
                <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Progress</th>
                <th className="px-[24px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Created Date</th>
                <th className="px-[24px] py-[16px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d7]">
              {jobs.map((job) => {
                const st = statusStyles[job.status] ?? { label: job.status, container: "bg-[#e7e7f3] text-[#434655]", Icon: Clock };
                const pct = job.totalLeads > 0 ? Math.round(((job.successCount + job.failedCount) / job.totalLeads) * 100) : 0;
                const progressLabel = job.status === "PROCESSING" ? `${job.successCount} / ${job.failedCount} / ${job.pendingCount}` : job.status === "COMPLETED" ? `${job.successCount} / ${job.failedCount}` : job.status === "FAILED" ? `0 / ${job.failedCount}` : `${job.pendingCount}`;
async function handleRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingJob) return;
    const form = e.currentTarget;
    const name = new FormData(form).get("name");
    if (typeof name !== "string") return;
    setRenameError("");
    setRenaming(true);
    const result = await updateGenerationJob(workspaceId, editingJob.id, name);
    setRenaming(false);
    if (result.status === "error") {
      setRenameError(result.message);
    } else {
      setEditingJob(null);
      notify({ title: "Job renamed", message: `Renamed to "${result.job.name}"`, tone: "success" });
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const result = await deleteGenerationJob(workspaceId, pendingDelete.id);
    setDeleting(false);
    if (result.status === "error") {
      setPendingDelete(null);
      notify({ title: "Couldn't delete job", message: result.message, tone: "error" });
    } else {
      setPendingDelete(null);
      notify({ title: "Job deleted", tone: "success" });
      router.refresh();
    }
  }

  return (
                  <tr
                    key={job.id}
                    className="hover:bg-[#f3f3fe] transition-colors group cursor-pointer"
                    onClick={() => router.push(`/workspace/${workspaceId}/generation-job/${job.id}`)}
                  >
                    <td className="px-[24px] py-[24px]">
                      <div className="font-semibold text-[14px] leading-[20px] tracking-[0.05em] text-[#191b23]">{job.name}</div>
                      <div className="text-[12px] leading-[16px] text-[#434655]">ID: {job.id}</div>
                    </td>
                    <td className="px-[24px] py-[24px]">
                      <span className={`inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-full ${st.container} text-[12px] leading-[16px] font-semibold`}>
                        <st.Icon className="size-[14px]" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-[24px] py-[24px] text-[14px] leading-[20px] text-[#191b23]">{job.totalLeads} Leads</td>
                    <td className="px-[24px] py-[24px]">
                      <div className="w-full max-w-[160px]">
                        <div className="flex justify-between items-center mb-[4px]">
                          <span className="text-[12px] leading-[16px] text-[#434655]">{progressLabel}</span>
                          <span className={`text-[12px] leading-[16px] font-semibold ${job.status === "FAILED" ? "text-[#ba1a1a]" : "text-[#006a63]"}`}>{pct}%</span>
                        </div>
                        <div className="h-[6px] w-full bg-[#e7e7f3] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${job.status === "FAILED" ? "bg-[#ba1a1a]" : job.status === "WAITING_FOR_API_QUOTA" ? "bg-[#737686]" : "bg-[#006a63]"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-[24px] py-[24px] text-[14px] leading-[20px] text-[#434655]">{formatDate(job.createdAt)}</td>
                    <td className="px-[24px] py-[24px] text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg text-[#434655] hover:bg-[#e7e7f3] transition-colors" title="Rename" onClick={() => { setRenameError(""); setEditingJob(job); }}>
                          <Pencil className="size-[18px]" />
                        </button>
                        <button className="p-2 rounded-lg text-[#434655] hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors" title="Delete" disabled={deleting} onClick={() => { setError(""); setPendingDelete(job); }}>
                          <Trash2 className="size-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-[24px] py-[16px] bg-[#f3f3fe] flex items-center justify-between border-t border-[#c3c6d7]">
          <span className="text-[14px] leading-[20px] text-[#434655]">{jobCount} results</span>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
        <div className="md:col-span-2 bg-white/80 backdrop-blur-[12px] border border-[#e1e2ed] p-[24px] rounded-xl relative overflow-hidden">
          <div className="flex items-center gap-[8px] mb-[16px]">
            <CheckCircle className="size-5 text-[#004ac6]" />
            <h4 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em]">Performance Analytics</h4>
          </div>
          <div className="flex gap-[32px]">
            <div>
              <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Avg. Gen Time</p>
              <p className="text-[24px] leading-[32px] font-semibold text-[#004ac6]">1.2s <span className="text-[14px] leading-[20px] text-[#006a63]">(-0.4s)</span></p>
            </div>
            <div>
              <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Quota Efficiency</p>
              <p className="text-[24px] leading-[32px] font-semibold text-[#004ac6]">98.2%</p>
            </div>
          </div>
        </div>
        <div className="bg-[#99efe5] p-[24px] rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] mb-[4px] opacity-90">Pro Tip</h4>
            <p className="text-[16px] leading-[24px]">Your jobs are being processed. Monitor progress and optimize your workflows for better efficiency.</p>
          </div>
          <button className="mt-[24px] w-full py-[8px] bg-white/20 hover:bg-white/30 rounded-lg text-[14px] leading-[20px] font-semibold tracking-[0.05em] transition-colors" type="button">Optimize Future Jobs</button>
        </div>
      </section>
    </div>
  );
}
