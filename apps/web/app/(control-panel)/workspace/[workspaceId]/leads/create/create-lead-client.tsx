"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { ArrowLeft, Send, Link as LinkIcon, Plus, Trash2, Mail, CheckCircle, RefreshCw } from "lucide-react";
import { useNotification } from "@repo/ui/notification-provider";
import { createLead } from "../../../../../src/actions/workspace/create-lead";
import type { GenerationJobInfo } from "../../../../../src/actions/workspace/workspace-info";

type Props = {
  workspaceId: string;
  jobs: GenerationJobInfo[];
};

export function CreateLeadClient({ workspaceId, jobs: initialJobs }: Props) {
  const { notify } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableJobs, setAvailableJobs] = useState(initialJobs);
  const [generationJobId, setGenerationJobId] = useState("");
  const [showJobTitle, setShowJobTitle] = useState(true);
  const [showLinkedin, setShowLinkedin] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!generationJobId) {
      notify({ title: "Validation Error", message: "Please select a generation job.", tone: "error" });
      return;
    }

    setSubmitting(true);

    const email = (document.getElementById("email") as HTMLInputElement)?.value ?? "";
    const name = (document.getElementById("name") as HTMLInputElement)?.value.trim() ?? "";
    const companyName = (document.getElementById("companyName") as HTMLInputElement)?.value.trim() ?? "";

    if (!name && !companyName) {
      notify({ title: "Validation Error", message: "Full Name or Company Name is required.", tone: "error" });
      setSubmitting(false);
      return;
    }
    const purpose = (document.getElementById("purpose") as HTMLTextAreaElement)?.value ?? "";
    const jobTitle = (document.getElementById("jobTitle") as HTMLInputElement)?.value ?? "";
    const linkedinUrl = (document.getElementById("linkedin") as HTMLInputElement)?.value ?? "";

    const metadataRows = document.querySelectorAll<HTMLDivElement>(".metadata-row");
    const customMetadata: Record<string, string> = {};
    metadataRows.forEach((row) => {
      const inputs = row.querySelectorAll<HTMLInputElement>("input");
      const key = inputs[0]?.value?.trim();
      const val = inputs[1]?.value?.trim();
      if (key && val) customMetadata[key] = val;
    });

    const metadata: Record<string, unknown> = {};
    if (name) metadata.name = name;
    if (companyName) metadata.companyName = companyName;
    metadata.purpose = purpose;
    if (jobTitle) metadata.jobTitle = jobTitle;
    if (linkedinUrl) metadata.linkedinUrl = linkedinUrl;
    Object.assign(metadata, customMetadata);

    const result = await createLead(workspaceId, generationJobId, { email, name, companyName, purpose, metadata });

    setSubmitting(false);

    if (result.status === "error") {
      notify({ title: "Failed to create lead", message: result.message, tone: "error" });
    } else {
      setSuccess(true);
      setAvailableJobs((prev) => prev.filter((j) => j.id !== generationJobId));
      setGenerationJobId("");
      notify({ title: "Lead Created", message: `Prospect ${email} has been added.`, tone: "success" });
      setTimeout(() => {
        setSuccess(false);
        formRef.current?.reset();
        const metaContainer = document.getElementById("metadata-container");
        if (metaContainer) {
          const rows = metaContainer.querySelectorAll<HTMLDivElement>(".metadata-row");
          for (let i = 1; i < rows.length; i++) rows[i]?.remove();
          rows[0]?.querySelectorAll("input").forEach((i) => { i.value = ""; });
        }
      }, 2000);
    }
  }

  function addMetadataRow() {
    const container = document.getElementById("metadata-container");
    if (!container) return;
    const row = document.createElement("div");
    row.className = "flex items-center gap-[8px] metadata-row animate-in fade-in slide-in-from-top-1 duration-200";
    row.innerHTML = `
      <input type="text" placeholder="Key (e.g. Region)" class="flex-1 px-[16px] py-[8px] bg-[#f3f3fe] border border-[#c3c6d7] rounded-lg focus:ring-1 focus:ring-[#004ac6] outline-none text-[14px] leading-[20px] font-[400]">
      <input type="text" placeholder="Value (e.g. EMEA)" class="flex-1 px-[16px] py-[8px] bg-[#f3f3fe] border border-[#c3c6d7] rounded-lg focus:ring-1 focus:ring-[#004ac6] outline-none text-[14px] leading-[20px] font-[400]">
      <button type="button" onclick="this.parentElement.remove()" class="p-[8px] text-[#737686] hover:text-[#ba1a1a] transition-colors">
        <svg class="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    `;
    container.appendChild(row);
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div
        className="fixed inset-0 opacity-20 pointer-events-none -z-10"
        style={{
          backgroundImage: "radial-gradient(#d1d5db 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />
      <main className="flex flex-grow items-center justify-center px-[32px] py-[48px]">
        <div className="w-full max-w-2xl">
          <header className="mb-[24px] text-center">
            <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23] mb-[8px]">Add Single Prospect</h1>
            <p className="text-[16px] leading-[24px] text-[#434655]">Manually input details for a single target.</p>
          </header>

          <details className="mb-[24px] rounded-lg border border-[#c3c6d7] bg-[#f3f3fe] p-[16px] text-[13px] leading-[20px] text-[#434655]">
            <summary className="cursor-pointer font-semibold text-[#004ac6]">Show example</summary>
            <div className="mt-[12px] space-y-[4px]">
              <p><span className="font-medium text-[#191b23]">Email:</span> jane@acme.com</p>
              <p><span className="font-medium text-[#191b23]">Name:</span> Jane Smith</p>
              <p><span className="font-medium text-[#191b23]">Company:</span> Acme Corp</p>
              <p><span className="font-medium text-[#191b23]">Purpose:</span> Introduce our AI platform to Acme's sales team</p>
              <p><span className="font-medium text-[#191b23]">Job Title:</span> VP of Sales</p>
              <p><span className="font-medium text-[#191b23]">LinkedIn:</span> linkedin.com/in/janesmith</p>
            </div>
          </details>

          <div className="rounded-xl border border-[#c3c6d7] bg-white/95 p-[32px] shadow-sm backdrop-blur-[8px] md:p-[48px]">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-[24px]">
              <div className="space-y-[8px]">
                <label className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]" htmlFor="generationJob">
                  Target Generation Job <span className="text-[#ba1a1a]">*</span>
                </label>
                <select
                  id="generationJob"
                  value={generationJobId}
                  onChange={(e) => setGenerationJobId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#c3c6d7] bg-white px-[16px] py-[16px] text-[16px] leading-[24px] outline-none transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]"
                >
                  <option value="">Select a generation job...</option>
                  {availableJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.name} ({job.totalLeads} leads)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-[8px]">
                <label className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]" htmlFor="email">
                  Lead Email Address <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative group">
                  <Mail className="absolute left-[16px] top-1/2 size-5 -translate-y-1/2 text-[#c3c6d7] transition-colors group-focus-within:text-[#004ac6]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-[48px] py-[16px] text-[16px] leading-[24px] outline-none transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]"
                  />
                </div>
              </div>

              <div className="space-y-[8px]">
                <label className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]" htmlFor="name">
                  Full Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-[16px] py-[16px] text-[16px] leading-[24px] outline-none transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]"
                />
              </div>

              <div className="space-y-[8px]">
                <label className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]" htmlFor="companyName">
                  Company Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Acme Corp"
                  className="w-full rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-[16px] py-[16px] text-[16px] leading-[24px] outline-none transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]"
                />
              </div>

              <div className="space-y-[8px]">
                <label className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]" htmlFor="purpose">
                  Email Purpose <span className="text-[#ba1a1a]">*</span>
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  required
                  rows={3}
                  placeholder="Why are you reaching out? E.g., Introduce product, schedule demo, partnership discussion..."
                  className="w-full rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-[16px] py-[16px] text-[16px] leading-[24px] outline-none transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6] resize-none"
                />
              </div>

              <div className="border-t border-[#c3c6d7] pt-[24px] space-y-[16px]">
                {showJobTitle ? (
                  <div className="flex items-end gap-[8px]">
                    <div className="flex-1 space-y-[8px]">
                      <label className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]" htmlFor="jobTitle">Job Title</label>
                      <input
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        placeholder="VP of Sales"
                        className="w-full rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-[16px] py-[16px] text-[16px] leading-[24px] outline-none transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]"
                      />
                    </div>
                    <button type="button" onClick={() => setShowJobTitle(false)} className="p-[16px] text-[#737686] hover:text-[#ba1a1a] transition-colors">
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowJobTitle(true)} className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold text-[#004ac6] hover:underline">
                    <Plus className="size-[18px]" /> Add Job Title
                  </button>
                )}
                {showLinkedin ? (
                  <div className="flex items-end gap-[8px]">
                    <div className="flex-1 space-y-[8px]">
                      <label className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]" htmlFor="linkedin">LinkedIn URL</label>
                      <div className="relative group">
                        <LinkIcon className="absolute left-[16px] top-1/2 size-5 -translate-y-1/2 text-[#c3c6d7] transition-colors group-focus-within:text-[#004ac6]" />
                        <input
                          id="linkedin"
                          name="linkedin"
                          type="url"
                          placeholder="linkedin.com/in/username"
                          className="w-full rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-[48px] py-[16px] text-[16px] leading-[24px] outline-none transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]"
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => setShowLinkedin(false)} className="p-[16px] text-[#737686] hover:text-[#ba1a1a] transition-colors">
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowLinkedin(true)} className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold text-[#004ac6] hover:underline">
                    <Plus className="size-[18px]" /> Add LinkedIn URL
                  </button>
                )}
              </div>

              <div className="border-t border-[#c3c6d7] pt-[24px]">
                <div className="mb-[16px] flex items-center justify-between">
                  <h3 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] uppercase text-[#434655]">Custom Metadata</h3>
                  <button
                    className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#004ac6] underline-offset-4 transition-all hover:underline decoration-2"
                    type="button"
                    onClick={addMetadataRow}
                  >
                    <Plus className="size-[18px]" /> Add Row
                  </button>
                </div>
                <div className="space-y-[8px]" id="metadata-container">
                  <div className="flex items-center gap-[8px] metadata-row animate-in fade-in slide-in-from-top-1 duration-200">
                    <input
                      type="text"
                      placeholder="Key (e.g. Region)"
                      className="flex-1 rounded-lg border border-[#c3c6d7] bg-[#f3f3fe] px-[16px] py-[8px] text-[14px] leading-[20px] font-[400] outline-none focus:ring-1 focus:ring-[#004ac6]"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. EMEA)"
                      className="flex-1 rounded-lg border border-[#c3c6d7] bg-[#f3f3fe] px-[16px] py-[8px] text-[14px] leading-[20px] font-[400] outline-none focus:ring-1 focus:ring-[#004ac6]"
                    />
                    <button
                      className="p-[8px] text-[#737686] transition-colors hover:text-[#ba1a1a]"
                      type="button"
                      onClick={(e) => (e.currentTarget.parentElement as HTMLDivElement).remove()}
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[16px] pt-[24px] sm:flex-row-reverse">
                <button
                  className="flex flex-1 items-center justify-center gap-[8px] rounded-lg bg-[#004ac6] px-[32px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-white shadow-sm transition-all hover:bg-[#003ea8] active:scale-95 disabled:opacity-60"
                  type="submit"
                  disabled={submitting || success}
                >
                  {submitting ? (
                    <><RefreshCw className="size-5 animate-spin" /> Processing...</>
                  ) : success ? (
                    <><CheckCircle className="size-5" /> Lead Created!</>
                  ) : (
                    <><Send className="size-5" /> Create Lead</>
                  )}
                </button>
                <Link
                  href={`/workspace/${workspaceId}/leads`}
                  className="flex flex-1 items-center justify-center gap-[8px] rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-[32px] py-[16px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] transition-all hover:bg-[#ededf9]"
                >
                  <ArrowLeft className="size-5" />
                  Back to Leads
                </Link>
              </div>
            </form>
          </div>

          <footer className="mt-[24px] space-y-[4px] text-center">
            <p className="text-[12px] leading-[16px] font-[400] text-[#737686]">&copy; 2024 ColdReach AI. Swiss-Engineered Precision.</p>
            <div className="flex justify-center gap-[16px]">
              <Link href="#" className="text-[12px] leading-[16px] font-[400] text-[#004ac6] hover:underline">Documentation</Link>
              <Link href="#" className="text-[12px] leading-[16px] font-[400] text-[#004ac6] hover:underline">Bulk Upload</Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
