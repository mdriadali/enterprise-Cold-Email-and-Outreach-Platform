"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Users,
  CheckCircle,
  AlertCircle,
  Hourglass,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  X,
  RefreshCw,
} from "lucide-react";
import { useNotification } from "@repo/ui/notification-provider";
import type { GenerationJobDetail } from "../../../../../../src/actions/workspace/get-generation-job";
import type { LeadInfo } from "../../../../../../src/actions/workspace/get-leads";

type Props = {
  workspaceId: string;
  generationJobId: string;
  currentPage: number;
  job: GenerationJobDetail;
  leads: LeadInfo[];
};

const PER_PAGE = 10;

const statusStyles: Record<string, { label: string; bg: string; text: string; pulse?: boolean }> = {
  GENERATED: { label: "GENERATED", bg: "bg-[#99efe5]", text: "text-[#006a63]" },
  PENDING: { label: "PENDING", bg: "bg-[#e7e7f3]", text: "text-[#434655]" },
  FAILED: { label: "FAILED", bg: "bg-[#ffdad6]", text: "text-[#ba1a1a]" },
  PROCESSING: { label: "PROCESSING", bg: "bg-[#e9ddff]", text: "text-[#5516be]", pulse: true },
  REGENERATED: { label: "REGENERATED", bg: "bg-[#dbe1ff]", text: "text-[#003ea8]" },
  RETRY_PENDING: { label: "RETRY PENDING", bg: "bg-amber-100", text: "text-amber-800" },
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

function extractPreview(lead: LeadInfo) {
  const emailParts = lead.email.split("@");
  const defaultName = emailParts[0]?.replace(/[._-]/g, " ") || "Valued Customer";
  const defaultInitial = defaultName.charAt(0).toUpperCase();

  if (!lead.generatedEmailData) {
    return {
      recipientName: defaultName,
      recipientInitial: defaultInitial,
      subject: "",
      greeting: "",
      body: "No email content has been generated for this lead yet.",
      signature: "",
    };
  }

  const data = lead.generatedEmailData as Record<string, unknown>;
  return {
    recipientName: defaultName,
    recipientInitial: defaultInitial,
    subject: typeof data.subject === "string" ? data.subject : "",
    greeting: typeof data.greeting === "string" ? data.greeting : "",
    body: typeof data.body === "string" ? data.body : "",
    signature: typeof data.closing === "string" ? data.closing : typeof data.signature === "string" ? data.signature : "",
  };
}

function MetricCard({
  label,
  value,
  icon,
  color,
  borderColor,
  subtext,
  subtextColor,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  borderColor?: string;
  subtext?: string;
  subtextColor?: string;
}) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-[12px] p-[24px] rounded-xl shadow-sm border ${borderColor || "border-[#c3c6d7]/30"}`}
    >
      <div className="flex justify-between items-start mb-[8px]">
        <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">
          {label}
        </span>
        <span className={color}>{icon}</span>
      </div>
      <div className="text-[32px] leading-[40px] font-bold tracking-[-0.02em] text-[#191b23]">{value}</div>
      {subtext && (
        <div className={`mt-[4px] text-[12px] leading-[16px] ${subtextColor || "text-[#434655]"}`}>
          {subtext}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? { label: status, bg: "bg-[#e7e7f3]", text: "text-[#434655]" };
  return (
    <span
      className={`inline-flex items-center gap-[4px] px-[8px] py-1 ${style.bg} ${style.text} rounded-full text-[12px] font-semibold uppercase tracking-tight`}
    >
      {style.pulse && <span className="w-2 h-2 rounded-full bg-[#5516be] animate-pulse" />}
      {style.label}
    </span>
  );
}

export function LeadsClient({ workspaceId, generationJobId, currentPage: serverPage, job, leads }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [previewLeadId, setPreviewLeadId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(job.totalLeads / PER_PAGE));
  const start = leads.length > 0 ? (serverPage - 1) * PER_PAGE + 1 : 0;
  const end = leads.length > 0 ? (serverPage - 1) * PER_PAGE + leads.length : 0;

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (l) => l.email.toLowerCase().includes(q) || l.id.toLowerCase().includes(q),
    );
  }, [leads, searchQuery]);

  const previewedLead = useMemo(
    () => (previewLeadId ? leads.find((l) => l.id === previewLeadId) ?? null : null),
    [previewLeadId, leads],
  );

  const previewData = useMemo(
    () => (previewedLead ? extractPreview(previewedLead) : null),
    [previewedLead],
  );

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    router.push(
      `/workspace/${workspaceId}/generation-job/${generationJobId}/leads${qs ? `?${qs}` : ""}`,
    );
  }

  function openPreview(lead: LeadInfo) {
    setPreviewLeadId(lead.id);
  }

  function closePreview() {
    setPreviewLeadId(null);
  }

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (serverPage > 3) pages.push("...");
      const startP = Math.max(2, serverPage - 1);
      const endP = Math.min(totalPages - 1, serverPage + 1);
      for (let i = startP; i <= endP; i++) pages.push(i);
      if (serverPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, serverPage]);

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="max-w-[1440px] mx-auto px-[32px] py-[32px] relative">
        <div
          className="fixed inset-0 opacity-20 pointer-events-none -z-10"
          style={{
            backgroundImage: "radial-gradient(#c3c6d7 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#dbe1ff]/20 to-transparent -z-10 blur-3xl" />

        {/* ───── HEADER ───── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-[32px] gap-[24px]">
          <div className="flex items-center gap-[16px]">
            <Link
              href={`/workspace/${workspaceId}/generation-job/${generationJobId}`}
              className="size-10 flex items-center justify-center rounded-full bg-[#f3f3fe] hover:bg-[#e7e7f3] transition-all text-[#434655]"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="text-[32px] leading-[40px] font-semibold tracking-[-0.01em] text-[#004ac6]">
                Leads Management
              </h1>
              <p className="text-[14px] leading-[20px] text-[#434655]">
                Manage and audit generated outreach for Job &quot;{job.name}&quot;
              </p>
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            <div className="relative">
              <Search className="size-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] pointer-events-none" />
              <input
                className="pl-10 pr-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none w-full md:w-64 text-[14px] leading-[20px] bg-white"
                placeholder="Search by email or ID..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="flex items-center gap-[4px] px-[16px] py-[8px] bg-[#e7e7f3] rounded-lg text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#191b23] hover:bg-[#e1e2ed] transition-all cursor-not-allowed opacity-70"
              type="button"
              disabled
            >
              <Filter className="size-[18px]" />
              Filter
            </button>
          </div>
        </header>

        {/* ───── METRICS ───── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] mb-[32px]">
          <MetricCard
            label="Total Leads"
            value={job.totalLeads}
            icon={<Users className="size-5" />}
            color="text-[#004ac6]"
            subtext="Across all status categories"
          />
          <MetricCard
            label="Generated"
            value={job.successCount}
            icon={<CheckCircle className="size-5" />}
            color="text-[#006a63]"
            subtext="Successfully generated"
            subtextColor="text-[#006a63]"
          />
          <MetricCard
            label="Failed"
            value={job.failedCount}
            icon={<AlertCircle className="size-5" />}
            color="text-[#ba1a1a]"
            subtext="Requires manual review"
          />
          <MetricCard
            label="Pending"
            value={job.pendingCount}
            icon={<Hourglass className="size-5" />}
            color="text-[#632ecd]"
            subtext="In generation queue"
          />
        </section>

        {/* ───── TABLE ───── */}
        <section className="bg-white rounded-xl border border-[#c3c6d7] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f3fe] border-b border-[#c3c6d7]">
                  <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">
                    LEAD IDENTITY
                  </th>
                  <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">
                    STATUS
                  </th>
                  <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">
                    CREATED AT
                  </th>
                  <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d7] text-[14px] leading-[20px]">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-[24px] py-[48px] text-center text-[#737686] text-[14px] leading-[20px]">
                      {searchQuery ? "No leads match your search." : "No leads found for this job."}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#f3f3fe] transition-colors">
                      <td className="px-[24px] py-[16px]">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#191b23]">{lead.email}</span>
                          <span className="text-[11px] text-[#737686] uppercase tracking-wider">
                            ID: {lead.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-[24px] py-[16px] text-[#434655]">{formatDate(lead.createdAt)}</td>
                      <td className="px-[24px] py-[16px] text-right">
                        {lead.generatedEmailData ? (
                          <button
                            className="px-[16px] py-[8px] bg-[#004ac6] text-white rounded-lg hover:bg-[#0053db] transition-all text-[12px] leading-[16px] font-semibold tracking-[0.05em]"
                            type="button"
                            onClick={() => openPreview(lead)}
                          >
                            View Email
                          </button>
                        ) : lead.status === "FAILED" ? (
                          <button
                            className="p-[6px] text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                            type="button"
                            title="Retry"
                          >
                            <RefreshCw className="size-5" />
                          </button>
                        ) : (
                          <button
                            className="px-[16px] py-[8px] bg-[#c3c6d7] text-white rounded-lg cursor-not-allowed text-[12px] leading-[16px] font-semibold tracking-[0.05em]"
                            type="button"
                            disabled
                          >
                            View Email
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ───── PAGINATION ───── */}
          <footer className="px-[24px] py-[16px] flex items-center justify-between border-t border-[#c3c6d7] bg-[#f3f3fe]">
            <p className="text-[14px] leading-[20px] text-[#434655]">
              {leads.length > 0
                ? `Showing ${start} to ${end} of ${job.totalLeads} leads`
                : "No leads to display"}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-[4px]">
                <button
                  className="p-[4px] rounded-lg hover:bg-[#e7e7f3] disabled:opacity-30 disabled:cursor-not-allowed"
                  type="button"
                  disabled={serverPage <= 1}
                  onClick={() => goToPage(serverPage - 1)}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div className="flex items-center gap-[4px]">
                  {pageNumbers.map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-[4px] text-[#737686] text-[14px] leading-[20px]">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`size-8 rounded-lg text-[12px] leading-[16px] font-semibold ${
                          p === serverPage
                            ? "bg-[#004ac6] text-white"
                            : "hover:bg-[#e7e7f3] text-[#191b23]"
                        }`}
                        type="button"
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>
                <button
                  className="p-[4px] rounded-lg hover:bg-[#e7e7f3] disabled:opacity-30 disabled:cursor-not-allowed"
                  type="button"
                  disabled={serverPage >= totalPages}
                  onClick={() => goToPage(serverPage + 1)}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </footer>
        </section>
      </div>

      {/* ───── PREVIEW SLIDE-OVER ───── */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          previewLeadId ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closePreview}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          previewLeadId ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-[24px] h-full flex flex-col">
          <div className="flex items-center justify-between mb-[32px] border-b border-[#c3c6d7] pb-[16px]">
            <div className="flex items-center gap-[16px]">
              <Mail className="size-6 text-[#004ac6]" />
              <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em]">Email Preview</h2>
            </div>
            <button
              className="p-[8px] hover:bg-[#f3f3fe] rounded-full transition-colors"
              type="button"
              onClick={closePreview}
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-grow">
            {previewData && previewedLead ? (
              <div className="space-y-[24px]">
                {/* Recipient header */}
                <div className="flex items-center gap-[16px] p-[16px] bg-[#f3f3fe] rounded-xl">
                  <div className="size-12 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-[18px] leading-[24px]">
                    {previewData.recipientInitial}
                  </div>
                  <div>
                    <p className="text-[14px] leading-[20px] font-semibold text-[#191b23]">
                      {previewData.recipientName}
                    </p>
                    <p className="text-[12px] leading-[16px] text-[#737686]">
                      {previewedLead.email}
                    </p>
                    <p className="text-[12px] leading-[16px] text-[#737686]">
                      Lead generated by ColdReach AI Engine v4
                    </p>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#737686] uppercase block mb-[8px]">
                    Subject Line
                  </label>
                  <div className="p-[16px] bg-white border border-[#c3c6d7] rounded-lg font-medium text-[#191b23] text-[14px] leading-[20px]">
                    {previewData.subject || "No subject available"}
                  </div>
                </div>

                {/* Body */}
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#737686] uppercase block mb-[8px]">
                    Message Content
                  </label>
                  <div className="p-[24px] bg-white border border-[#c3c6d7] rounded-lg text-[16px] leading-[24px] space-y-[16px] min-h-[300px]">
                    {previewData.greeting && <p>{previewData.greeting}</p>}
                    <p className="leading-relaxed text-[#434655]">{previewData.body}</p>
                    {previewData.signature && (
                      <p className="italic text-[#191b23]">{previewData.signature}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-[#737686]">
                <Mail className="size-16 mb-[16px] opacity-30" />
                <p className="text-[16px] leading-[24px]">Select a lead to preview</p>
              </div>
            )}
          </div>

          {/* Action footer */}
          <div className="mt-[32px] pt-[24px] border-t border-[#c3c6d7] flex gap-[16px]">
            <button
              className="flex-grow py-[16px] bg-[#004ac6] text-white rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:brightness-110 transition-all flex items-center justify-center gap-[8px] disabled:opacity-40 disabled:cursor-not-allowed"
              type="button"
              disabled={!previewData?.subject}
            >
              <Send className="size-5" />
              Approve & Send
            </button>
            <button
              className="px-[24px] py-[16px] border border-[#c3c6d7] rounded-xl text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:bg-[#f3f3fe] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              type="button"
              disabled={!previewData?.subject}
            >
              Regenerate
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
