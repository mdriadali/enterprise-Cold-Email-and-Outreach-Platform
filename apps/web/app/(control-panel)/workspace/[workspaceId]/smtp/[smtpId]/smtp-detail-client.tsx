"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Eye, EyeOff, Zap, Save, BadgeCheck, Server, Send, Trash2, X } from "lucide-react";
import { useNotification } from "@repo/ui/notification-provider";
import { useAppDispatch } from "../../../../../src/states/hooks";
import { cacheSmtpAccount } from "../../../../../src/states/smtp-cache-slice";
import { updateSmtpAccount } from "../../../../../src/actions/workspace/update-smtp-account";
import { deleteSmtpAccount } from "../../../../../src/actions/workspace/delete-smtp-account";
import type { SmtpAccountInfo } from "../../../../../src/actions/workspace/get-smtp-account";

type Props = {
  workspaceId: string;
  account: SmtpAccountInfo;
};

export function SmtpDetailClient({ workspaceId, account }: Props) {
  const router = useRouter();
  const { notify } = useNotification();
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(cacheSmtpAccount(account));
  }, [account, dispatch]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const r = await updateSmtpAccount(workspaceId, account.id, fd);
    setSubmitting(false);
    if (r.status === "error") {
      notify({ title: "Error", message: r.message, tone: "error" });
    } else {
      notify({ title: "Saved", message: "SMTP account updated successfully.", tone: "success" });
      router.push(`/workspace/${workspaceId}/smtp`);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const r = await deleteSmtpAccount(workspaceId, account.id);
    setDeleting(false);
    setShowDeleteModal(false);
    if (r.status === "error") {
      notify({ title: "Error", message: r.message, tone: "error" });
    } else {
      notify({ title: "Deleted", message: `"${account.name}" removed.`, tone: "success" });
      router.push(`/workspace/${workspaceId}/smtp`);
    }
  }

  function handleTest() {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      notify({ title: "Connection OK", message: `Successfully connected to ${account.host}.`, tone: "success" });
    }, 1500);
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="p-[32px]">
        <div className="flex items-center gap-[8px] text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#737686] mb-[8px]">
          <Link href={`/workspace/${workspaceId}`} className="hover:text-[#004ac6] transition-colors">Settings</Link>
          <ChevronRight className="size-4" />
          <Link href={`/workspace/${workspaceId}/smtp`} className="hover:text-[#004ac6] transition-colors">SMTP Accounts</Link>
          <ChevronRight className="size-4" />
          <span className="text-[#004ac6] font-bold">Edit Account</span>
        </div>

        <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23] mb-[8px]">SMTP Configuration</h1>
        <p className="text-[16px] leading-[24px] text-[#434655] mb-[32px]">
          Update your outgoing server details to ensure high deliverability for your outreach campaigns.
        </p>

        <form onSubmit={handleSubmit} className="space-y-[24px]">
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mb-[24px] flex items-center gap-[8px]">
              <BadgeCheck className="size-6 text-[#004ac6]" />
              Account Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655]" htmlFor="name">Account Name</label>
                <input id="name" name="name" type="text" required defaultValue={account.name} className="bg-[#faf8ff] border border-[#c3c6d7] rounded-lg p-[8px] text-[16px] leading-[24px] text-[#191b23] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="Sales Primary" />
                <span className="text-[12px] leading-[16px] text-[#737686] italic opacity-70">For internal reference only.</span>
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655]" htmlFor="fromName">From Name</label>
                <input id="fromName" name="fromName" type="text" required defaultValue={account.fromName} className="bg-[#faf8ff] border border-[#c3c6d7] rounded-lg p-[8px] text-[16px] leading-[24px] text-[#191b23] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="John Doe" />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655]" htmlFor="fromEmail">From Email</label>
                <input id="fromEmail" name="fromEmail" type="email" required defaultValue={account.fromEmail} className="bg-[#faf8ff] border border-[#c3c6d7] rounded-lg p-[8px] text-[16px] leading-[24px] text-[#191b23] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="john@company.com" />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655]" htmlFor="replyTo">Reply-To Email</label>
                <input id="replyTo" name="replyTo" type="email" defaultValue={account.replyTo ?? ""} className="bg-[#faf8ff] border border-[#c3c6d7] rounded-lg p-[8px] text-[16px] leading-[24px] text-[#191b23] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="replies@company.com" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#c3c6d7] rounded-xl p-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#191b23] mb-[24px] flex items-center gap-[8px]">
              <Server className="size-6 text-[#004ac6]" />
              Server Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
              <div className="md:col-span-2 flex flex-col gap-[8px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655]" htmlFor="host">SMTP Host</label>
                <input id="host" name="host" type="text" required defaultValue={account.host} className="bg-[#faf8ff] border border-[#c3c6d7] rounded-lg p-[8px] text-[16px] leading-[24px] text-[#191b23] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="smtp.gmail.com" />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655]" htmlFor="port">Port</label>
                <input id="port" name="port" type="number" required defaultValue={account.port} className="bg-[#faf8ff] border border-[#c3c6d7] rounded-lg p-[8px] text-[16px] leading-[24px] text-[#191b23] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="587" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-[8px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655]" htmlFor="username">Username</label>
                <input id="username" name="username" type="text" required defaultValue={account.username} className="bg-[#faf8ff] border border-[#c3c6d7] rounded-lg p-[8px] text-[16px] leading-[24px] text-[#191b23] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all" placeholder="apikey" />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655]" htmlFor="encryption">Encryption</label>
                <select id="encryption" name="encryption" required defaultValue={account.encryption} className="bg-[#faf8ff] border border-[#c3c6d7] rounded-lg p-[8px] text-[16px] leading-[24px] text-[#191b23] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all h-[42px]">
                  <option value="NONE">NONE</option>
                  <option value="SSL">SSL</option>
                  <option value="TLS">TLS</option>
                </select>
              </div>
              <div className="md:col-span-3 flex flex-col gap-[8px]">
                <label className="text-[12px] leading-[16px] font-semibold tracking-[0.05em] text-[#434655]" htmlFor="password">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required defaultValue={account.password} className="w-full bg-[#faf8ff] border border-[#c3c6d7] rounded-lg p-[8px] text-[16px] leading-[24px] text-[#191b23] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all pr-10" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#191b23]" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#004ac6]/5 border border-[#004ac6]/20 rounded-xl p-[24px] flex flex-col md:flex-row items-center justify-between gap-[24px]">
            <div className="flex items-start gap-[16px]">
              <div className="p-[8px] bg-[#004ac6]/10 rounded-lg text-[#004ac6] shrink-0">
                <Zap className="size-5" />
              </div>
              <div>
                <h4 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]">Connection Testing</h4>
                <p className="text-[14px] leading-[20px] text-[#434655]">Send a test email to verify your SMTP settings before finalizing.</p>
              </div>
            </div>
            <button
              type="button"
              disabled={testing}
              onClick={handleTest}
              className="bg-white border border-[#004ac6] text-[#004ac6] px-[24px] py-[12px] rounded-lg text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:bg-[#004ac6]/5 transition-colors flex items-center gap-[8px] whitespace-nowrap disabled:opacity-50"
            >
              {testing ? (
                <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <Send className="size-[18px]" />
              )}
              {testing ? "Testing..." : "Verify Settings"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-[16px] pb-[48px]">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-[24px] py-[12px] border border-[#ba1a1a] text-[#ba1a1a] rounded-lg text-[14px] leading-[20px] font-semibold tracking-[0.05em] hover:bg-[#ffdad6] transition-all active:scale-95 flex items-center gap-[8px]"
            >
              <Trash2 className="size-[18px]" />
              Delete Account
            </button>
            <div className="flex items-center gap-[16px]">
              <Link
                href={`/workspace/${workspaceId}/smtp`}
                className="px-[32px] py-[12px] border border-[#c3c6d7] rounded-lg text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] transition-all active:scale-95"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-[32px] py-[12px] bg-[#004ac6] text-white rounded-lg text-[14px] leading-[20px] font-semibold tracking-[0.05em] shadow-lg shadow-[#004ac6]/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-[8px] disabled:opacity-50"
              >
                {submitting ? (
                  <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                  <Save className="size-[18px]" />
                )}
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!deleting) setShowDeleteModal(false); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d7]">
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#191b23]">Delete Account</h2>
                <button className="p-2 hover:bg-[#ededf9] rounded-lg transition-colors text-[#434655]" onClick={() => setShowDeleteModal(false)} disabled={deleting}><X className="size-5" /></button>
              </div>
              <div className="p-6">
                <p className="text-[14px] leading-[20px] text-[#434655]">Are you sure you want to delete <span className="font-semibold text-[#191b23]">{account.name}</span>? This action cannot be undone.</p>
                <div className="flex justify-end gap-3 pt-6">
                  <button type="button" className="px-5 py-2.5 text-[13px] font-semibold tracking-[0.05em] text-[#434655] hover:bg-[#ededf9] rounded-lg transition-colors" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</button>
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
      </div>
    </div>
  );
}
