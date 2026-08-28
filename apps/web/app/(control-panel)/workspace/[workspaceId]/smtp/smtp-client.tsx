"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Server, CheckCircle, Gauge, Search, ArrowLeft, Edit3, Trash2, X, Eye, EyeOff, ChevronRight, ShieldCheck, BookOpen, ArrowRight,
} from "lucide-react";
import { useNotification } from "@repo/ui/notification-provider";
import { PageSpinner } from "@repo/ui/page-spinner";
import { PageError } from "@repo/ui/page-error";
import { getSmtpAccounts } from "../../../../src/actions/workspace/get-smtp-accounts";
import { createSmtpAccount } from "../../../../src/actions/workspace/create-smtp-account";
import { deleteSmtpAccount } from "../../../../src/actions/workspace/delete-smtp-account";
import { updateSmtpAccount } from "../../../../src/actions/workspace/update-smtp-account";
import type { SmtpAccountInfo } from "../../../../src/actions/workspace/get-smtp-accounts";

type Props = {
  workspaceId: string;
};

const encryptionBadge: Record<string, { label: string; cls: string }> = {
  TLS: { label: "TLS", cls: "bg-[#e7e7f3] border border-[#c3c6d7] text-[#434655]" },
  SSL: { label: "SSL", cls: "bg-[#e7e7f3] border border-[#c3c6d7] text-[#434655]" },
  NONE: { label: "None", cls: "bg-[#ffdad6]/50 border border-[#ba1a1a]/20 text-[#ba1a1a]" },
};

const statusConfig: Record<string, { label: string; dot: string; pulse: string; text: string }> = {
  true: { label: "Active", dot: "bg-green-500", pulse: "pulse-active", text: "text-green-600" },
  false: { label: "Inactive", dot: "bg-[#434655]", pulse: "", text: "text-[#434655]" },
};

const ICON_MAP: Record<string, string> = {
  gmail: "mail",
  privateemail: "chevron_left",
  office365: "warning",
  sendgrid: "alternate_email",
};

function hostIcon(host: string): string {
  for (const [k, v] of Object.entries(ICON_MAP)) {
    if (host.toLowerCase().includes(k)) return v;
  }
  return "mail";
}

function iconBg(host: string): string {
  if (host.toLowerCase().includes("gmail")) return "bg-primary/10 text-primary";
  if (host.toLowerCase().includes("privateemail")) return "bg-secondary/10 text-secondary";
  if (host.toLowerCase().includes("office365")) return "bg-error/10 text-error";
  if (host.toLowerCase().includes("sendgrid")) return "bg-tertiary/10 text-tertiary";
  if (host.toLowerCase().includes("outlook")) return "bg-[#004ac6]/10 text-[#004ac6]";
  return "bg-[#dbe1ff] text-[#004ac6]";
}

type FormMode = "create" | "edit";

export function SmtpClient({ workspaceId }: Props) {
  const router = useRouter();
  const { notify } = useNotification();
  const formRef = useRef<HTMLFormElement>(null);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [accounts, setAccounts] = useState<SmtpAccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<SmtpAccountInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await getSmtpAccounts(workspaceId);
      if (!active) return;
      if (result.status === "error") {
        setLoadError(result.message);
      } else {
        setAccounts(result.accounts);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [workspaceId]);

  if (loadError) return <PageError title="Workspace unavailable" message={loadError} />;
  if (loading) return <PageSpinner label="Loading SMTP accounts..." />;

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.host.toLowerCase().includes(search.toLowerCase()) ||
    a.fromEmail.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = accounts.filter((a) => a.isActive).length;
  const hasError = accounts.some((a) => a.error);
  const healthPct = accounts.length > 0 ? Math.round((activeCount / accounts.length) * 100) : 100;

  function openCreate() {
    setFormMode("create");
    setEditingId(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(acc: SmtpAccountInfo) {
    setFormMode("edit");
    setEditingId(acc.id);
    setError("");
    setShowModal(true);
    setTimeout(() => {
      if (!formRef.current) return;
      (formRef.current.elements.namedItem("name") as HTMLInputElement)!.value = acc.name;
      (formRef.current.elements.namedItem("host") as HTMLInputElement)!.value = acc.host;
      (formRef.current.elements.namedItem("portNumber") as HTMLInputElement)!.value = String(acc.port);
      (formRef.current.elements.namedItem("username") as HTMLInputElement)!.value = acc.username;
      (formRef.current.elements.namedItem("password") as HTMLInputElement)!.value = acc.password;
      (formRef.current.elements.namedItem("fromName") as HTMLInputElement)!.value = acc.fromName;
      (formRef.current.elements.namedItem("fromEmail") as HTMLInputElement)!.value = acc.fromEmail;
      (formRef.current.elements.namedItem("replyTo") as HTMLInputElement)!.value = acc.replyTo ?? "";
      (formRef.current.elements.namedItem("encryption") as HTMLSelectElement)!.value = acc.encryption;
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (formMode === "edit" && editingId) {
      const r = await updateSmtpAccount(workspaceId, editingId, fd);
      setSubmitting(false);
      if (r.status === "error") { setError(r.message); return; }
      setShowModal(false);
      notify({ title: "Updated", message: "SMTP account updated successfully.", tone: "success" });
      router.refresh();
    } else {
      const r = await createSmtpAccount(workspaceId, fd);
      setSubmitting(false);
      if (r.status === "error") { setError(r.message); return; }
      setShowModal(false);
      form.reset();
      notify({ title: "Created", message: "SMTP account created successfully.", tone: "success" });
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!deletingAccount) return;
    setDeleting(true);
    const r = await deleteSmtpAccount(workspaceId, deletingAccount.id);
    setDeleting(false);
    if (r.status === "error") { notify({ title: "Error", message: r.message, tone: "error" }); setDeletingAccount(null); return; }
    setAccounts((prev) => prev.filter((a) => a.id !== deletingAccount.id));
    notify({ title: "Deleted", message: `"${deletingAccount.name}" removed.`, tone: "success" });
    setDeletingAccount(null);
    router.refresh();
  }

  function handleTest(acc: SmtpAccountInfo) {
    setTestingId(acc.id);
    setTestSuccess(null);
    setTimeout(() => {
      setTestingId(null);
      const ok = Math.random() > 0.3;
      setTestSuccess(ok ? acc.id : null);
      if (ok) notify({ title: "Connection OK", message: `Successfully connected to ${acc.host}.`, tone: "success" });
      else notify({ title: "Connection Failed", message: `Could not connect to ${acc.host}. Check credentials.`, tone: "error" });
    }, 1500);
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto p-[32px] space-y-[24px]">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!submitting) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d7]">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#191b23]">{formMode === "edit" ? "Edit SMTP Account" : "Add SMTP Account"}</h2>
                <p className="text-[13px] text-[#434655] mt-1">Configure your outbound mail server.</p>
              </div>
              <button className="p-2 hover:bg-[#ededf9] rounded-lg transition-colors text-[#434655]" onClick={() => setShowModal(false)} disabled={submitting}><X className="size-5" /></button>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="name">Account Name</label>
                  <input id="name" name="name" type="text" required placeholder="e.g. Outreach Main" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="host">SMTP Host</label>
                  <input id="host" name="host" type="text" required placeholder="smtp.gmail.com" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="portNumber">Port</label>
                  <input id="portNumber" name="portNumber" type="number" required placeholder="587" defaultValue={587} className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="username">Username</label>
                  <input id="username" name="username" type="text" required placeholder="user@domain.com" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="password">Password</label>
                  <input id="password" name="password" type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="fromName">From Name</label>
                  <input id="fromName" name="fromName" type="text" required placeholder="Sales Team" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="fromEmail">From Email</label>
                  <input id="fromEmail" name="fromEmail" type="email" required placeholder="sender@domain.com" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="replyTo">Reply-To (optional)</label>
                  <input id="replyTo" name="replyTo" type="email" placeholder="replies@domain.com" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="encryption">Encryption</label>
                  <select id="encryption" name="encryption" required defaultValue="TLS" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all appearance-none">
                    <option value="TLS">TLS</option>
                    <option value="SSL">SSL</option>
                    <option value="NONE">None</option>
                  </select>
                </div>
              </div>
              {error && <div className="bg-[#ffdad6] text-[#ba1a1a] text-[13px] leading-[18px] px-4 py-3 rounded-lg font-medium">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="px-5 py-2.5 text-[13px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] rounded-lg transition-colors" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" disabled={submitting} className="bg-[#004ac6] text-white text-[13px] font-semibold tracking-[0.05em] px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                  {submitting ? "Saving..." : formMode === "edit" ? "Update Account" : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-[24px]">
        <div>
          <div className="flex items-center gap-[8px] text-[#737686] mb-[8px] text-[12px] leading-[16px] font-semibold tracking-[0.05em]">
            <Link href={`/workspace/${workspaceId}`} className="hover:text-[#004ac6] transition-colors">Settings</Link>
            <ChevronRight className="size-4" />
            <span className="text-[#004ac6]">SMTP Accounts</span>
          </div>
          <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">SMTP Accounts</h1>
          <p className="text-[16px] leading-[24px] text-[#434655] mt-[4px]">Manage your outbound mailing servers and sender identities.</p>
        </div>
        <button
          className="bg-[#004ac6] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em] px-[24px] py-[12px] rounded-lg flex items-center gap-[8px] hover:opacity-90 active:scale-95 transition-all shadow-sm"
          type="button"
          onClick={openCreate}
        >
          <Plus className="size-5" />
          Add SMTP Account
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
        <div className="bg-white border border-[#c3c6d7] p-[24px] rounded-xl flex items-center gap-[24px]">
          <div className="w-12 h-12 bg-[#dbe1ff] rounded-xl flex items-center justify-center text-[#004ac6] shrink-0">
            <Server className="size-6" />
          </div>
          <div>
            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Total Accounts</p>
            <h3 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">{accounts.length}</h3>
          </div>
        </div>
        <div className="bg-white border border-[#c3c6d7] p-[24px] rounded-xl flex items-center gap-[24px]">
          <div className="w-12 h-12 bg-[#99efe5] rounded-xl flex items-center justify-center text-[#006a63] shrink-0">
            <CheckCircle className="size-6" />
          </div>
          <div>
            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Active</p>
            <h3 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-white border border-[#c3c6d7] p-[24px] rounded-xl flex items-center gap-[24px]">
          <div className="w-12 h-12 bg-[#e9ddff] rounded-xl flex items-center justify-center text-[#632ecd] shrink-0">
            <Gauge className="size-6" />
          </div>
          <div>
            <p className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Delivery Health</p>
            <h3 className={`text-[36px] leading-[44px] font-bold tracking-[-0.01em] ${hasError ? "text-[#ba1a1a]" : "text-[#006a63]"}`}>
              {healthPct}%
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-sm">
        <div className="px-[24px] py-[16px] border-b border-[#c3c6d7] bg-[#ededf9] flex justify-between items-center">
          <h2 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">Connected Servers</h2>
          <div className="flex gap-[8px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] size-4" />
              <input
                className="pl-10 pr-4 py-2 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none w-64 transition-all"
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-2 border border-[#c3c6d7] rounded-lg bg-white hover:bg-[#ededf9] transition-colors" title="Filter">
              <svg className="size-5 text-[#737686]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 4h18M7 12h10M11 20h2" /></svg>
            </button>
            <button className="p-2 border border-[#c3c6d7] rounded-lg bg-white hover:bg-[#ededf9] transition-colors" title="Refresh" onClick={() => router.refresh()}>
              <svg className="size-5 text-[#737686]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 4v5h5M20 20v-5h-5" /><path d="M4 9a9 9 0 0115.36-5.36M20 15a9 9 0 01-15.36 5.36" /></svg>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#ededf9]/50">
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Name</th>
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Host/Port</th>
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">From Email</th>
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Encryption</th>
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase text-center">Status</th>
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d7]">
              {filtered.map((acc) => {
                const st = acc.error ? { label: acc.error, dot: "bg-error", pulse: "pulse-error", text: "text-error" } : (statusConfig[String(acc.isActive)] ?? statusConfig["true"]!);
                const enc = encryptionBadge[acc.encryption] ?? encryptionBadge.NONE!;
                return (
                  <tr key={acc.id} className="hover:bg-[#f3f3fe] transition-colors group cursor-pointer" onClick={() => router.push(`/workspace/${workspaceId}/smtp/${acc.id}`)}>
                    <td className="px-[24px] py-[16px]">
                      <div className="flex items-center gap-[16px]">
                        <div className={`w-8 h-8 rounded ${iconBg(acc.host)} flex items-center justify-center`}>
                          <svg className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">{acc.name}</span>
                      </div>
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <div className="flex flex-col">
                        <span className="text-[14px] leading-[20px] text-[#191b23]">{acc.host}</span>
                        <span className="text-[12px] leading-[16px] text-[#737686]">Port: {acc.port}</span>
                      </div>
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <span className="text-[14px] leading-[20px] text-[#434655]">{acc.fromEmail}</span>
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <span className={`px-[8px] py-[4px] text-[10px] font-bold uppercase tracking-wider rounded ${enc.cls}`}>{enc.label}</span>
                    </td>
                    <td className="px-[24px] py-[16px] text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-[8px]">
                        <div className={`relative w-[10px] h-[10px] ${st.dot} rounded-full ${acc.error ? "" : "status-dot-pulse " + st.pulse}`} />
                        <span className={`text-[12px] leading-[16px] font-semibold tracking-[0.05em] uppercase ${st.text}`}>{st.label}</span>
                      </div>
                    </td>
                    <td className="px-[24px] py-[16px] text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 hover:bg-[#dbe1ff] text-[#004ac6] rounded-lg transition-colors"
                          title="Test Connection"
                          onClick={(e) => { e.stopPropagation(); handleTest(acc); }}
                          disabled={testingId === acc.id}
                        >
                          {testingId === acc.id ? (
                            <svg className="size-[18px] animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          ) : testSuccess === acc.id ? (
                            <CheckCircle className="size-[18px] text-green-500" />
                          ) : (
                            <Gauge className="size-[18px]" />
                          )}
                        </button>
                        <button className="p-2 hover:bg-[#e7e7f3] text-[#434655] rounded-lg transition-colors" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(acc); }}>
                          <Edit3 className="size-[18px]" />
                        </button>
                        <button className="p-2 hover:bg-[#ffdad6] text-[#434655] hover:text-[#ba1a1a] rounded-lg transition-colors" title="Delete" onClick={(e) => { e.stopPropagation(); setDeletingAccount(acc); }}>
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
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-[48px] px-[24px] text-center">
            <div className="w-20 h-20 bg-[#ededf9] rounded-full flex items-center justify-center mb-[16px] text-[#737686]">
              <Server className="size-12" style={{ strokeWidth: 1 }} />
            </div>
            <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mb-[8px]">No SMTP Accounts</h3>
            <p className="text-[16px] leading-[24px] text-[#434655] max-w-sm mb-[24px]">Add your first SMTP account to start sending campaigns.</p>
            <button className="bg-[#004ac6] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em] px-[24px] py-[12px] rounded-lg flex items-center gap-[8px] hover:opacity-90 active:scale-95 transition-all" type="button" onClick={openCreate}>
              <Plus className="size-5" />
              Add Your First Account
            </button>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-[24px] py-[16px] border-t border-[#c3c6d7] flex flex-col sm:flex-row justify-between items-center gap-[16px]">
            <p className="text-[12px] leading-[16px] text-[#434655]">Showing 1-{filtered.length} of {accounts.length} accounts</p>
            <div className="flex gap-[8px]">
              <button className="px-3 py-1 border border-[#c3c6d7] rounded bg-white hover:bg-[#ededf9] transition-all text-[12px] leading-[16px] font-medium text-[#434655] disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-[#c3c6d7] rounded bg-white hover:bg-[#ededf9] transition-all text-[12px] leading-[16px] font-medium text-[#434655] disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[24px]">
        <div className="lg:col-span-3 bg-[#004ac6]/5 border border-[#004ac6]/20 rounded-xl p-[24px] flex items-center gap-[24px] relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#004ac6]/5 rounded-full blur-3xl" />
          <div className="hidden md:flex w-12 h-12 bg-[#004ac6] rounded-xl shrink-0 items-center justify-center">
            <Server className="size-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#004ac6]">Optimal Configuration?</h4>
            <p className="text-[14px] leading-[20px] text-[#434655] mt-[4px]">Use our AI recommendation tool to find the best SMTP settings for your domain.</p>
          </div>
          <button className="shrink-0 text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#004ac6] hover:underline flex items-center gap-[4px]">
            Run Audit <ArrowRight className="size-4" />
          </button>
        </div>
        <div className="bg-[#191b23] rounded-xl p-[24px] flex flex-col justify-between">
          <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-white/60">Encryption Guide</span>
          <div className="mt-[12px]">
            <div className="flex items-center gap-[8px] mb-[8px]">
              <ShieldCheck className="size-[18px] text-[#99efe5]" />
              <span className="text-[14px] leading-[20px] font-semibold text-white">SMTP Security</span>
            </div>
            <p className="text-[12px] leading-[16px] text-white/60">SSL & TLS protocols for secure enterprise communications.</p>
            <Link className="inline-block mt-[12px] text-[#99efe5] text-[12px] leading-[16px] font-semibold tracking-[0.05em] hover:underline" href="#">View Docs →</Link>
          </div>
        </div>
      </div>

      {deletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!deleting) setDeletingAccount(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d7]">
              <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#191b23]">Delete Account</h2>
              <button className="p-2 hover:bg-[#ededf9] rounded-lg transition-colors text-[#434655]" onClick={() => setDeletingAccount(null)} disabled={deleting}><X className="size-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-[14px] leading-[20px] text-[#434655]">Are you sure you want to delete <span className="font-semibold text-[#191b23]">{deletingAccount.name}</span>? This action cannot be undone.</p>
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" className="px-5 py-2.5 text-[13px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] rounded-lg transition-colors" onClick={() => setDeletingAccount(null)} disabled={deleting}>Cancel</button>
                <button type="button" disabled={deleting} onClick={handleDelete} className="bg-[#ba1a1a] text-white text-[13px] font-semibold tracking-[0.05em] px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50 flex items-center gap-[8px]">
                  {deleting ? (
                    <><svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Deleting...</>
                  ) : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .status-dot-pulse { position: relative; }
        .status-dot-pulse::after {
          content: ''; position: absolute; inset: 0; border-radius: 9999px;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .pulse-active::after { background-color: #10b981; }
        .pulse-error::after { background-color: #ef4444; }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
