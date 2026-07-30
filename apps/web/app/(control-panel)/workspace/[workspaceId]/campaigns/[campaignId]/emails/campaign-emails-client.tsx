"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  Bolt,
  CheckCircle,
  ChevronRight,
  Download,
  Filter,
  Search,
  Eye,
  MousePointerClick,
  Reply,
  X,
} from "lucide-react";
import type { CampaingEmailData } from "@repo/types";
import { useAppDispatch, useAppSelector } from "../../../../../../src/states/hooks";
import { cacheSmtpAccount } from "../../../../../../src/states/smtp-cache-slice";
import { getSmtpAccount } from "../../../../../../src/actions/workspace/get-smtp-account";

type Props = {
  workspaceId: string;
  campaignId: string;
  campaignName: string;
  initialEmails: CampaingEmailData[];
};

const statusStyles: Record<string, { badge: string; dot: string }> = {
  PENDING: { badge: "bg-[#e1e2ed] text-[#434655]", dot: "bg-[#737686]" },
  PROCESSING: { badge: "bg-[#dbe1ff] text-[#004ac6]", dot: "bg-[#004ac6]" },
  SENT: { badge: "bg-[#99efe5] text-[#006a63]", dot: "bg-[#006a63]" },
  REPLIED: { badge: "bg-[#99efe5] text-[#00504a]", dot: "bg-[#006a63]" },
  BOUNCED: { badge: "bg-[#ffdad6] text-[#93000a]", dot: "bg-[#ba1a1a]" },
  FAILED: { badge: "bg-[#ffdad6] text-[#93000a]", dot: "bg-[#ba1a1a]" },
};

export function CampaignEmailsClient({ workspaceId, campaignId, campaignName, initialEmails }: Props) {
  const [selected, setSelected] = useState<CampaingEmailData | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const dispatch = useAppDispatch();
  const smtpCache = useAppSelector((s) => s.smtpCache);

  useEffect(() => {
    if (!selected?.smtpId) return;
    if (smtpCache[selected.smtpId]) return;
    (async () => {
      const res = await getSmtpAccount(workspaceId, selected.smtpId!);
      if (res.status === "success") dispatch(cacheSmtpAccount(res.account));
    })();
  }, [selected?.smtpId, workspaceId, dispatch, smtpCache]);

  const smtpAccount = selected?.smtpId ? smtpCache[selected.smtpId] : null;

  const filtered = useMemo(() => {
    if (!search && statusFilter === "All Statuses") return initialEmails;
    return initialEmails.filter((e) => {
      if (search && !`${e.email} ${e.subject}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "All Statuses" && e.status !== statusFilter.toUpperCase()) return false;
      return true;
    });
  }, [initialEmails, search, statusFilter]);

  const totalSent = initialEmails.length;
  const openedCount = initialEmails.filter((e) => (e.opened ?? 0) > 0).length;
  const clickedCount = initialEmails.filter((e) => (e.clicked ?? 0) > 0).length;
  const repliedCount = initialEmails.filter((e) => (e.replied ?? 0) > 0 || e.status === "REPLIED").length;
  const bouncedCount = initialEmails.filter((e) => e.status === "BOUNCED").length;
  const openRate = totalSent > 0 ? ((openedCount / totalSent) * 100).toFixed(1) : "0.0";
  const clickRate = totalSent > 0 ? ((clickedCount / totalSent) * 100).toFixed(1) : "0.0";
  const bounceRate = totalSent > 0 ? ((bouncedCount / totalSent) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col gap-[24px] flex-1 min-h-0">
      {/* Metrics Bar */}
      <div className="grid grid-cols-5 gap-[16px]">
        <div className="bg-white p-[16px] rounded-xl border border-[#c3c6d7] shadow-sm flex flex-col gap-[4px]">
          <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Total Sent</span>
          <div className="flex items-end justify-between">
            <span className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">{totalSent}</span>
            {totalSent > 0 && (
              <span className="text-[#006a63] text-[12px] leading-[16px] font-bold bg-[#99efe5] px-[4px] rounded flex items-center gap-1">
                <ArrowUp className="size-[12px]" /> {Math.round((openedCount / totalSent) * 100)}%
              </span>
            )}
          </div>
        </div>
        <div className="bg-white p-[16px] rounded-xl border border-[#c3c6d7] shadow-sm flex flex-col gap-[4px]">
          <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Open Rate</span>
          <div className="flex items-end justify-between">
            <span className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">{openRate}%</span>
            <span className="text-[#006a63] text-[12px] leading-[16px] font-bold bg-[#99efe5] px-[4px] rounded flex items-center gap-1">
              <ArrowUp className="size-[12px]" /> 4%
            </span>
          </div>
        </div>
        <div className="bg-white p-[16px] rounded-xl border border-[#c3c6d7] shadow-sm flex flex-col gap-[4px]">
          <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Click Rate</span>
          <div className="flex items-end justify-between">
            <span className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">{clickRate}%</span>
            <span className="text-[#93000a] text-[12px] leading-[16px] font-bold bg-[#ffdad6] px-[4px] rounded flex items-center gap-1">
              <ArrowDown className="size-[12px]" /> 2%
            </span>
          </div>
        </div>
        <div className="bg-white p-[16px] rounded-xl border border-[#c3c6d7] shadow-sm flex flex-col gap-[4px]">
          <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Replies</span>
          <div className="flex items-end justify-between">
            <span className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">{repliedCount}</span>
            <span className="text-[#006a63] text-[12px] leading-[16px] font-bold bg-[#99efe5] px-[4px] rounded flex items-center gap-1">
              <ArrowUp className="size-[12px]" /> 8%
            </span>
          </div>
        </div>
        <div className="bg-white p-[16px] rounded-xl border border-[#c3c6d7] shadow-sm flex flex-col gap-[4px]">
          <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Bounce Rate</span>
          <div className="flex items-end justify-between">
            <span className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">{bounceRate}%</span>
            <span className="text-[#006a63] text-[12px] leading-[16px] font-bold bg-[#99efe5] px-[4px] rounded flex items-center gap-1">
              <CheckCircle className="size-[12px]" /> Healthy
            </span>
          </div>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="flex-1 flex gap-[24px] overflow-hidden min-h-0 relative">
        {/* Table Section */}
        <div className="flex-1 bg-white rounded-xl border border-[#c3c6d7] shadow-sm flex flex-col overflow-hidden">
          {/* Filter & Search Header */}
          <div className="p-[16px] border-b border-[#c3c6d7] flex justify-between items-center bg-[#faf8ff]">
            <div className="flex gap-[8px]">
              <div className="relative">
                <Search className="size-[16px] absolute left-[8px] top-1/2 -translate-y-1/2 text-[#737686]" />
                <input
                  className="pl-[32px] pr-[16px] py-[8px] bg-[#f3f3fe] border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] w-[256px] outline-none transition-all focus:ring-2 focus:ring-[#004ac6] focus:border-transparent"
                  placeholder="Search recipients or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="bg-[#f3f3fe] border border-[#c3c6d7] rounded-lg px-[16px] py-[8px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] outline-none focus:ring-2 focus:ring-[#004ac6] transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Statuses</option>
                <option>Sent</option>
                <option>Opened</option>
                <option>Clicked</option>
                <option>Replied</option>
                <option>Bounced</option>
              </select>
            </div>
            <div className="flex gap-[8px]">
              <button className="flex items-center gap-[4px] px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] hover:bg-[#f3f3fe] transition-all text-[#737686]">
                <Filter className="size-[16px]" />
                <span className="text-[14px] leading-[20px] font-semibold tracking-[0.05em]">More Filters</span>
              </button>
              <button className="flex items-center gap-[4px] px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] hover:bg-[#f3f3fe] transition-all text-[#737686]">
                <Download className="size-[16px]" />
                <span className="text-[14px] leading-[20px] font-semibold tracking-[0.05em]">Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#f3f3fe] z-10">
                <tr>
                  <th className="px-[16px] py-[8px] border-b border-[#c3c6d7] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Recipient</th>
                  <th className="px-[16px] py-[8px] border-b border-[#c3c6d7] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Step</th>
                  <th className="px-[16px] py-[8px] border-b border-[#c3c6d7] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Status</th>
                  <th className="px-[16px] py-[8px] border-b border-[#c3c6d7] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Engagement</th>
                  <th className="px-[16px] py-[8px] border-b border-[#c3c6d7] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Sent At</th>
                  <th className="px-[16px] py-[8px] border-b border-[#c3c6d7]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d7]">
                {filtered.map((email) => {
                  const s = (statusStyles[email.status] ?? statusStyles.PENDING)!;
                  const isSelected = selected?.id === email.id;
                  return (
                    <tr
                      key={email.id}
                      className={`hover:bg-[#f3f3fe] transition-colors cursor-pointer active:scale-[0.99] transition-transform duration-75 ${isSelected ? "bg-[#dbe1ff]/30" : ""}`}
                      onClick={() => setSelected(email)}
                    >
                      <td className="px-[16px] py-[12px]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#191b23] text-[14px]">{email.email.split("@")[0]}</span>
                          <span className="text-[12px] leading-[16px] text-[#737686]">{email.email}</span>
                        </div>
                      </td>
                      <td className="px-[16px] py-[12px]">
                        <span className="bg-[#e7e7f3] px-[8px] py-[2px] rounded text-[12px] leading-[16px] font-bold">Step {email.stepNumber}</span>
                      </td>
                      <td className="px-[16px] py-[12px]">
                        <span className={`inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-full text-[11px] leading-[16px] font-bold ${s.badge}`}>
                          <span className={`w-[6px] h-[6px] rounded-full ${s.dot} ${email.status === "BOUNCED" || email.status === "PROCESSING" ? "animate-pulse" : ""}`} />
                          {email.status}
                        </span>
                        {email.errorMessage && (
                          <p className="text-[10px] leading-[14px] text-[#ba1a1a] mt-[4px] max-w-[140px] truncate" title={email.errorMessage}>
                            {email.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-[16px] py-[12px]">
                        <div className="flex gap-[16px]">
                          {(email.opened ?? 0) > 0 ? (
                            <div className="flex items-center gap-1 text-[#004ac6] font-bold">
                              <Eye className="size-[16px]" />
                              <span className="text-[12px] leading-[16px]">{email.opened}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[#737686]">
                              <Eye className="size-[16px]" />
                              <span className="text-[12px] leading-[16px]">0</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[#737686]">
                            <MousePointerClick className="size-[16px]" />
                            <span className="text-[12px] leading-[16px]">{email.clicked ?? 0}</span>
                          </div>
                          {(email.replied ?? 0) > 0 ? (
                            <div className="flex items-center gap-1 text-[#006a63] font-bold">
                              <Reply className="size-[16px]" />
                              <span className="text-[12px] leading-[16px]">{email.replied}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-[16px] py-[12px]">
                        <div className="flex flex-col">
                          <span className="text-[14px] leading-[20px] text-[#191b23]">
                            {email.sentAt
                              ? new Date(email.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                              : "—"}
                          </span>
                          {email.sentAt && (
                            <span className="text-[10px] leading-[14px] text-[#737686] uppercase">
                              {new Date(email.sentAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-[16px] py-[12px] text-right">
                        <ChevronRight className={`size-[20px] text-[#737686] transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-[16px] py-[32px] text-center text-[#737686]">No emails found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Preview Card — overlay */}
        {selected && <EmailPreviewCard
          selected={selected}
          smtpAccount={smtpAccount}
          campaignName={campaignName}
          onClose={() => setSelected(null)}
        />}
      </div>
    </div>
  );
}

type SmtpCardInfo = { fromName: string; fromEmail: string } | null | undefined;

function EmailPreviewCard({ selected, smtpAccount, campaignName, onClose }: {
  selected: CampaingEmailData;
  smtpAccount: SmtpCardInfo;
  campaignName: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed top-[100px] right-[24px] w-[360px] bg-white rounded-xl border border-[#c3c6d7] shadow-xl z-[100] flex flex-col max-h-[520px] overflow-hidden"
    >
      <div className="p-[12px] bg-[#f3f3fe] border-b border-[#c3c6d7] flex justify-between items-center">
        <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Email Preview</span>
        <button onClick={onClose} className="p-[4px] hover:bg-[#e1e2ed] rounded-md text-[#737686] transition-colors">
          <X className="size-[16px]" />
        </button>
      </div>
      <div className="flex-1 p-[14px] overflow-y-auto">
        <div className="flex items-center justify-between mb-[8px]">
          <h3 className="text-[14px] leading-[20px] font-bold text-[#191b23] truncate mr-[8px]">{selected.subject}</h3>
          <span className="text-[9px] leading-[12px] font-bold px-[6px] py-[2px] rounded border border-[#c3c6d7] text-[#737686] uppercase shrink-0">{selected.status}</span>
        </div>
        <div className="flex items-center gap-[8px] mb-[10px] pb-[10px] border-b border-[#e1e2ed]">
          <div className="size-[28px] rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-[11px] shrink-0">
            {campaignName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[12px] leading-[16px] font-bold text-[#191b23] truncate">{smtpAccount?.fromName ?? "Unknown"}</div>
            <div className="text-[10px] leading-[14px] text-[#737686] truncate">&lt;{smtpAccount?.fromEmail ?? "unknown"}&gt;</div>
            <div className="text-[10px] leading-[14px] text-[#737686]">
              To: <span className="font-semibold">{selected.email}</span>
            </div>
          </div>
        </div>
        <div className="text-[13px] leading-[20px] text-[#191b23] space-y-[8px]">
          <p>{selected.greeting}</p>
          <p className="whitespace-pre-wrap line-clamp-6">{selected.body}</p>
        </div>
        {selected.signature && (
          <div className="mt-[12px] pt-[10px] border-t border-[#e1e2ed]">
            <p className="text-[12px] leading-[16px] font-bold">{selected.signature}</p>
          </div>
        )}
      </div>
      <div className="p-[10px] bg-[#f3f3fe] border-t border-[#c3c6d7] flex justify-between items-center">
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] leading-[20px] font-bold text-[#191b23]">{selected.stepNumber}</span>
          <span className="text-[9px] leading-[12px] text-[#737686] uppercase font-bold">Step</span>
        </div>
        <Bolt className="size-[16px] text-[#004ac6]" />
        <button className="bg-[#004ac6] text-white px-[12px] py-[4px] rounded text-[11px] leading-[16px] font-bold tracking-[0.05em] hover:opacity-90 transition-all">
          Resend
        </button>
      </div>
    </div>
  );
}
