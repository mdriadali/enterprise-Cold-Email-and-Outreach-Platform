"use client";

import { Key, ArrowLeft, Search, Plus, Edit3, Trash2, ToggleLeft, ToggleRight, BookOpen, ShieldCheck, TrendingUp, Gauge, AlertTriangle, Network, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { createApiKey } from "../../../../src/actions/workspace/create-api-key";
import { updateApiKey } from "../../../../src/actions/workspace/update-api-key";
import { deleteApiKey } from "../../../../src/actions/workspace/delete-api-key";
import type { FoundApiKey, ApiKeySummary } from "../../../../src/actions/workspace/find-api-keys";
import { useNotification } from "@repo/ui/notification-provider";

type Props = {
  workspaceId: string;
  keys: FoundApiKey[];
  summary: ApiKeySummary;
};

const providerMeta: Record<string, { label: string; desc: string; bg: string; iconBg: string }> = {
  GEMINI: { label: "Gemini", desc: "Production Environment", bg: "bg-blue-50 text-blue-700", iconBg: "bg-blue-100" },
  GROQ: { label: "Groq Cloud", desc: "LPU Inference", bg: "bg-orange-50 text-orange-700", iconBg: "bg-orange-100" },
  OPENROUTER: { label: "OpenRouter Hub", desc: "Aggregate API", bg: "bg-slate-100 text-slate-700", iconBg: "bg-slate-200" },
  CEREBRAS: { label: "Cerebras AI", desc: "WSE-3 Cluster", bg: "bg-purple-50 text-purple-700", iconBg: "bg-purple-100" },
};

const statusStyles: Record<string, { label: string; container: string; dot: string }> = {
  AVAILABLE: { label: "AVAILABLE", container: "bg-[#99efe5] text-[#006a63]", dot: "bg-[#006a63]" },
  RATE_LIMITED: { label: "RATE_LIMITED", container: "bg-[#ffdad6] text-[#ba1a1a]", dot: "bg-[#ba1a1a]" },
  INVALID: { label: "INVALID", container: "bg-[#ffdad6]/50 text-[#ba1a1a]", dot: "bg-[#ba1a1a]" },
  DISABLED: { label: "DISABLED", container: "bg-[#e7e7f3] text-[#434655]", dot: "bg-[#434655]" },
};

const providerInitials: Record<string, string> = {
  GEMINI: "GM",
  GROQ: "GQ",
  OPENROUTER: "OR",
  CEREBRAS: "CB",
};

export function ApiKeysClient({ workspaceId, keys, summary }: Props) {
  const router = useRouter();
  const { notify } = useNotification();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState<FoundApiKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FoundApiKey | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const filtered = keys.filter((k) => {
    const meta = providerMeta[k.aiProvider];
    if (!meta) return true;
    return meta.label.toLowerCase().includes(search.toLowerCase()) || k.aiProvider.toLowerCase().includes(search.toLowerCase());
  });
  const activeCount = summary.available;
  const rateLimitedCount = summary.rateLimited;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = e.currentTarget;
    const result = await createApiKey(workspaceId, new FormData(form));
    setSubmitting(false);
    if (result.status === "error") {
      setError(result.message);
    } else {
      setShowModal(false);
      form.reset();
      router.refresh();
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingKey) return;
    const form = e.currentTarget;
    setError("");
    setSubmitting(true);
    const result = await updateApiKey(workspaceId, editingKey.id, new FormData(form));
    setSubmitting(false);
    if (result.status === "error") {
      setError(result.message);
    } else {
      setEditingKey(null);
      form.reset();
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setDeleting(true);
    setError("");
    const result = await deleteApiKey(workspaceId, id);
    setDeleting(false);
    if (result.status === "error") {
      setPendingDelete(null);
      notify({ title: "Couldn't delete API key", message: result.message, tone: "error" });
    } else {
      setPendingDelete(null);
      notify({ title: "API key deleted", tone: "success" });
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
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#191b23]">Connect New Provider</h2>
                <p className="text-[13px] text-[#434655] mt-1">Add an AI provider API key to your workspace.</p>
              </div>
              <button className="p-2 hover:bg-[#ededf9] rounded-lg transition-colors text-[#434655]" onClick={() => setShowModal(false)} disabled={submitting}><X className="size-5" /></button>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="provider">AI Provider</label>
                <select id="provider" name="provider" required className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all appearance-none">
                  <option value="">Select a provider</option>
                  <option value="GEMINI">Gemini</option>
                  <option value="GROQ">Groq Cloud</option>
                  <option value="OPENROUTER">OpenRouter Hub</option>
                  <option value="CEREBRAS">Cerebras AI</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="key">API Key</label>
                <div className="relative">
                  <input id="key" name="key" type={showKey ? "text" : "password"} required placeholder="Paste your API key here" className="w-full px-4 py-3 pr-12 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#191b23]" onClick={() => setShowKey((v) => !v)}>
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {error && <div className="bg-[#ffdad6] text-[#ba1a1a] text-[13px] leading-[18px] px-4 py-3 rounded-lg font-medium">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="px-5 py-2.5 text-[13px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] rounded-lg transition-colors" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" disabled={submitting} className="bg-[#004ac6] text-white text-[13px] font-semibold tracking-[0.05em] px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                  {submitting ? "Connecting..." : "Connect Provider"}
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
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#191b23]">Delete API Key</h2>
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
                  <p className="text-[14px] leading-[20px] text-[#191b23]">Are you sure you want to delete <span className="font-semibold">{providerMeta[pendingDelete.aiProvider]?.label ?? pendingDelete.aiProvider}</span> API key?</p>
                  <p className="text-[13px] leading-[18px] text-[#434655] mt-1">Emails won't be sent with this provider anymore.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#c3c6d7]">
              <button type="button" className="px-5 py-2.5 text-[13px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] rounded-lg transition-colors" onClick={() => setPendingDelete(null)} disabled={deleting}>Cancel</button>
              <button type="button" disabled={deleting} onClick={handleDelete} className="bg-[#ba1a1a] text-white text-[13px] font-semibold tracking-[0.05em] px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete Key"}
              </button>
            </div>
          </div>
        </div>
      )}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!submitting) setEditingKey(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d7]">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#191b23]">Edit Provider Key</h2>
                <p className="text-[13px] text-[#434655] mt-1">Update credential details for {editingKey.aiProvider}.</p>
              </div>
              <button className="p-2 hover:bg-[#ededf9] rounded-lg transition-colors text-[#434655]" onClick={() => setEditingKey(null)} disabled={submitting}><X className="size-5" /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-5">
              <div>
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="edit-provider">AI Provider</label>
                <select id="edit-provider" name="provider" defaultValue={editingKey.aiProvider} className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all appearance-none">
                  <option value="GEMINI">Gemini</option>
                  <option value="GROQ">Groq Cloud</option>
                  <option value="OPENROUTER">OpenRouter Hub</option>
                  <option value="CEREBRAS">Cerebras AI</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-2" htmlFor="edit-key">API Key</label>
                <input id="edit-key" name="key" type="text" required placeholder="Paste your API key here" className="w-full px-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] text-[#191b23] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none transition-all" />
              </div>
              {error && <div className="bg-[#ffdad6] text-[#ba1a1a] text-[13px] leading-[18px] px-4 py-3 rounded-lg font-medium">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="px-5 py-2.5 text-[13px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] rounded-lg transition-colors" onClick={() => setEditingKey(null)} disabled={submitting}>Cancel</button>
                <button type="submit" disabled={submitting} className="bg-[#004ac6] text-white text-[13px] font-semibold tracking-[0.05em] px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                  {submitting ? "Updating..." : "Update Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-[24px]">
        <div className="flex items-center gap-[16px]">
          <Link href={`/workspace/${workspaceId}`} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#c3c6d7] hover:bg-[#ededf9] transition-colors">
            <ArrowLeft className="size-5 text-[#434655]" />
          </Link>
          <div>
            <h1 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23]">API Keys Management</h1>
            <p className="text-[14px] leading-[20px] text-[#434655]">Manage AI provider credentials for your workspace.</p>
          </div>
        </div>
        <button className="bg-[#004ac6] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em] px-[24px] py-[12px] rounded-lg flex items-center gap-[8px] hover:opacity-90 active:scale-95 transition-all shadow-sm" type="button" onClick={() => setShowModal(true)}>
          <Plus className="size-5" />
          Connect New Provider
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
        <div className="bg-white/80 backdrop-blur-[12px] border border-[#e1e2ed] p-[24px] rounded-xl flex items-start justify-between">
          <div>
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-[8px]">Total API Keys</span>
            <span className="text-[36px] leading-[44px] font-bold tracking-[-0.01em]">{keys.length}</span>
            <div className="flex items-center gap-[4px] mt-[8px] text-[#006a63]">
              <TrendingUp className="size-4" />
              <span className="text-[12px] leading-[16px]">Active in workspace</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#004ac6]">
            <Key className="size-6" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-[12px] border border-[#e1e2ed] p-[24px] rounded-xl flex items-start justify-between">
          <div>
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-[8px]">Active Providers</span>
            <span className="text-[36px] leading-[44px] font-bold tracking-[-0.01em]">{activeCount}</span>
            <div className="flex items-center gap-[4px] mt-[8px] text-[#434655]">
              <Network className="size-4" />
              <span className="text-[12px] leading-[16px]">{keys.map(k => k.aiProvider).filter((v, i, a) => a.indexOf(v) === i).length} provider types</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#99efe5] flex items-center justify-center text-[#006a63]">
            <Network className="size-6" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-[12px] border border-[#e1e2ed] p-[24px] rounded-xl flex items-start justify-between">
          <div>
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-[8px]">Rate-Limited Instances</span>
            <span className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#ba1a1a]">{rateLimitedCount}</span>
            {rateLimitedCount > 0 && (
              <div className="flex items-center gap-[4px] mt-[8px] text-[#ba1a1a]">
                <AlertTriangle className="size-4" />
                <span className="text-[12px] leading-[16px]">Requires attention</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
            <Gauge className="size-6" />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-[12px] border border-[#c3c6d7] rounded-xl overflow-hidden shadow-sm">
        <div className="px-[24px] py-[16px] border-b border-[#c3c6d7] bg-[#f3f3fe] flex justify-between items-center">
          <h2 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">Configured Keys</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] size-4" />
            <input
              className="pl-10 pr-4 py-2 bg-white border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] focus:ring-2 focus:ring-[#004ac6] focus:border-transparent outline-none w-64 transition-all"
              placeholder="Search keys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#c3c6d7] bg-white">
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Provider</th>
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Key Snippet</th>
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase">Status</th>
                <th className="px-[24px] py-[16px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d7]">
              {filtered.map((key) => {
                const meta = providerMeta[key.aiProvider] ?? { label: key.aiProvider, desc: "", bg: "bg-gray-100 text-gray-700", iconBg: "bg-gray-200" };
                const st = statusStyles[key.status] ?? { label: "UNKNOWN", container: "bg-[#e7e7f3] text-[#434655]", dot: "bg-[#434655]" };
                const initials = providerInitials[key.aiProvider] ?? key.aiProvider.slice(0, 2);
                return (
                  <tr key={key.id} className="hover:bg-[#f3f3fe] transition-colors group">
                    <td className="px-[24px] py-[16px]">
                      <div className="flex items-center gap-[16px]">
                        <div className={`w-10 h-10 rounded-lg ${meta.iconBg} flex items-center justify-center text-sm font-bold ${meta.bg.split(" ")[1]}`}>
                          {initials}
                        </div>
                        <div>
                          <div className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">{meta.label}</div>
                          <div className="text-[12px] leading-[16px] text-[#434655]">{meta.desc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <span className="font-mono text-[14px] leading-[20px] text-[#434655] bg-[#ededf9] px-2 py-1 rounded">
                        {key.apiKey || "••••••••"}
                      </span>
                    </td>
                    <td className="px-[24px] py-[16px]">
                      <span className={`inline-flex items-center gap-[4px] px-2 py-1 rounded-full ${st.container} text-[11px] font-bold tracking-[0.05em]`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${key.status === "RATE_LIMITED" ? "animate-pulse" : ""}`} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-[24px] py-[16px] text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-[8px]">
                        <button className="p-2 hover:bg-[#e7e7f3] rounded-lg text-[#434655] transition-colors" title="Edit" onClick={() => { setError(""); setEditingKey(key); }}>
                          <Edit3 className="size-[20px]" />
                        </button>
                        <button className="p-2 hover:bg-[#e7e7f3] rounded-lg text-[#434655] transition-colors" title={key.status === "DISABLED" ? "Enable" : "Disable"}>
                          {key.status === "DISABLED" ? <ToggleLeft className="size-[20px]" /> : <ToggleRight className="size-[20px]" />}
                        </button>
                        <button className="p-2 hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded-lg text-[#434655] transition-colors" title="Delete" onClick={() => { setError(""); setPendingDelete(key); }} disabled={deleting}>
                          <Trash2 className="size-[20px]" />
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
              <Key className="size-12" style={{ strokeWidth: 1 }} />
            </div>
            <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] mb-[8px]">No API Keys Found</h3>
            <p className="text-[16px] leading-[24px] text-[#434655] max-w-sm mb-[24px]">Connect your first AI provider to enable outreach automation features.</p>
            <button className="bg-[#004ac6] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em] px-[24px] py-[12px] rounded-lg flex items-center gap-[8px]" type="button" onClick={() => setShowModal(true)}>
              <Plus className="size-5" />
              Add Your First Key
            </button>
          </div>
        )}
        <div className="px-[24px] py-[16px] border-t border-[#c3c6d7] flex flex-col sm:flex-row justify-between items-center gap-[16px]">
          <p className="text-[12px] leading-[16px] text-[#434655]">Showing {filtered.length} of {keys.length} configured keys.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[24px]">
        <div className="lg:col-span-3 bg-[#004ac6]/5 border border-[#004ac6]/20 rounded-xl p-[24px] flex items-center gap-[24px] relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#004ac6]/5 rounded-full blur-3xl" />
          <div className="hidden md:flex w-16 h-16 bg-[#004ac6] text-white rounded-xl shrink-0 items-center justify-center">
            <BookOpen className="size-8" />
          </div>
          <div>
            <h4 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#004ac6] mb-[4px]">Security Best Practices</h4>
            <p className="text-[14px] leading-[20px] text-[#434655]">Rotate API keys every 90 days. Keys are encrypted at rest using AES-256-GCM.</p>
          </div>
          <button className="ml-auto shrink-0 text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#004ac6] hover:underline flex items-center gap-[4px]">
            View Docs
            <span>→</span>
          </button>
        </div>
        <div className="bg-[#e7e7f3] border border-[#c3c6d7] rounded-xl p-[24px] flex flex-col justify-between">
          <span className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655] block mb-[16px]">Usage Tier</span>
          <div>
            <div className="flex justify-between items-end mb-[8px]">
              <span className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em]">{keys.length > 0 ? Math.min(Math.round((keys.length / 50) * 100), 100) : 0}%</span>
              <span className="text-[12px] leading-[16px] text-[#434655]">Plan Quota</span>
            </div>
            <div className="w-full h-1.5 bg-[#c3c6d7] rounded-full overflow-hidden">
              <div className="h-full bg-[#004ac6]" style={{ width: `${Math.min(Math.round((keys.length / 50) * 100), 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
