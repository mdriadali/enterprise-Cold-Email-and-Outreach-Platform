"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRight, Upload, UserPlus, ChevronRight, ShieldCheck, Server, Verified } from "lucide-react";
import type { GenerationJobInfo } from "../../../../src/actions/workspace/workspace-info";

type Props = {
  workspaceId: string;
  jobs: GenerationJobInfo[];
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "N/A";
  }
}

export function LeadsClient({ workspaceId, jobs }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter((job) =>
    job.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-0 flex-1 overflow-auto p-[32px]">
      <div className="flex flex-col gap-[48px]">
        <header className="space-y-[8px] text-center">
          <div className="mb-[16px] inline-flex items-center gap-[8px] rounded-full bg-[#ededf9] px-[16px] py-[4px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#004ac6]">
            <ShieldCheck className="size-[18px]" />
            {workspaceId}
          </div>
          <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">Leads Management</h1>
          <p className="mx-auto max-w-xl text-[16px] leading-[24px] text-[#434655]">
            Select a job to view leads or add new prospects manually. Streamline your outreach with precision-targeted data.
          </p>
        </header>

        <div className="grid h-full grid-cols-1 gap-[24px] md:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-[#c3c6d7] bg-white/80 p-[32px] backdrop-blur-[12px] transition-all duration-300 hover:translate-y-[-4px] hover:border-[#004ac6] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <div className="mb-[24px]">
              <div className="mb-[16px] flex size-12 items-center justify-center rounded-lg bg-[#dbe1ff] text-[#004ac6]">
                <svg className="size-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              </div>
              <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">View Job Leads</h2>
              <p className="mt-[4px] text-[14px] leading-[20px] text-[#434655]">Access leads generated from your automated campaigns.</p>
            </div>

            <div className="flex-grow space-y-[16px]">
              <label className="block">
                <span className="mb-[8px] block text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655]">Recent Generation Jobs</span>
                <div className="relative">
                  <input
                    className="w-full rounded-lg border border-[#c3c6d7] bg-white py-[16px] pl-xl pr-[16px] text-[14px] leading-[20px] transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6] outline-none"
                    placeholder="Search jobs..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-[16px] top-1/2 size-5 -translate-y-1/2 text-[#c3c6d7]" />
                </div>
              </label>

              <div className="max-h-[240px] space-y-[8px] overflow-y-auto pr-[8px]">
                {filteredJobs.length === 0 ? (
                  <div className="py-[24px] text-center text-[14px] leading-[20px] text-[#737686]">
                    {searchQuery ? "No jobs match your search." : "No generation jobs yet."}
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/workspace/${workspaceId}/generation-job/${job.id}/leads`}
                      className="flex w-full items-center justify-between rounded-lg p-[16px] text-left transition-colors hover:bg-[#dbe1ff] group/item"
                    >
                      <div>
                        <div className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">{job.name}</div>
                        <div className="text-[12px] leading-[16px] text-[#434655]">{job.totalLeads.toLocaleString()} leads &bull; Created {formatDate(job.createdAt)}</div>
                      </div>
                      <ChevronRight className="size-5 text-[#004ac6] opacity-0 transition-opacity group-hover/item:opacity-100" />
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="mt-[24px] border-t border-[#c3c6d7] pt-[24px]">
              <Link
                href={`/workspace/${workspaceId}/generation-job`}
                className="flex w-full items-center justify-center gap-[8px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#004ac6] transition-all hover:gap-[16px]"
              >
                View All Generation Jobs
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-dashed border-[#c3c6d7] bg-white/80 p-[32px] backdrop-blur-[12px] transition-all duration-300 hover:translate-y-[-4px] hover:border-[#004ac6] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <div className="mb-[24px]">
              <div className="mb-[16px] flex size-12 items-center justify-center rounded-lg bg-[#99efe5] text-[#006f67]">
                <UserPlus className="size-7" />
              </div>
              <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">Create New Leads</h2>
            </div>

            <div className="flex flex-grow flex-col justify-center gap-[24px]">
              <div className="grid grid-cols-2 gap-[16px]">
                <button
                  className="flex cursor-pointer flex-col items-center gap-[12px] rounded-xl border border-[#c3c6d7] bg-white p-[24px] text-center transition-all hover:border-[#004ac6] hover:shadow-md active:scale-[0.97]"
                  type="button"
                  onClick={() => router.push(`/workspace/${workspaceId}/leads/create?import=csv`)}
                >
                  <div className="flex size-14 items-center justify-center rounded-xl bg-[#dbe1ff] text-[#004ac6]">
                    <Upload className="size-7" />
                  </div>
                  <div>
                    <div className="text-[16px] leading-[24px] font-semibold text-[#191b23]">CSV Import</div>
                    <div className="text-[13px] leading-[18px] text-[#434655]">Bulk upload from file</div>
                  </div>
                </button>
                <button
                  className="flex cursor-pointer flex-col items-center gap-[12px] rounded-xl border border-[#c3c6d7] bg-white p-[24px] text-center transition-all hover:border-[#004ac6] hover:shadow-md active:scale-[0.97]"
                  type="button"
                  onClick={() => router.push(`/workspace/${workspaceId}/leads/create`)}
                >
                  <div className="flex size-14 items-center justify-center rounded-xl bg-[#99efe5] text-[#006a63]">
                    <svg className="size-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <div className="text-[16px] leading-[24px] font-semibold text-[#191b23]">Single Entry</div>
                    <div className="text-[13px] leading-[18px] text-[#434655]">Add one prospect at a time</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-[24px]">
              <button
                className="flex w-full items-center justify-center gap-[8px] rounded-lg bg-[#004ac6] py-[14px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-white transition-all hover:bg-[#003ea8] active:scale-[0.98] shadow-sm"
                type="button"
                onClick={() => router.push(`/workspace/${workspaceId}/leads/create`)}
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                Create Manual Leads
              </button>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-center gap-[32px] text-[#434655] opacity-60">
          <div className="flex items-center gap-[8px]">
            <Verified className="size-[16px]" />
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em]">Strategic Enterprise Outreach System v2.4</span>
          </div>
          <div className="size-1 rounded-full bg-[#c3c6d7]" />
          <div className="flex items-center gap-[8px]">
            <Server className="size-[16px]" />
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em]">Active Instance: {workspaceId.slice(0, 8)}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
