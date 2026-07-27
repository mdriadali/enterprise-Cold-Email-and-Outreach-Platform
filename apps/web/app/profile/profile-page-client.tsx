"use client";

import { useState } from "react";
import { CheckCircle2, Edit3, X, Check, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotification } from "@repo/ui/notification-provider";
import { signOutEnterpriseAccount } from "../src/actions/auth/logout";

type ProfilePageProps = {
  name: string;
  email: string;
  role: string;
  onUpdateName: (name: string) => Promise<{ status: "success" } | { status: "error"; message: string }>;
};

export function ProfilePage({ name, email, role, onUpdateName }: ProfilePageProps) {
  const router = useRouter();
  const { notify } = useNotification();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const initial = name.trim().slice(0, 1).toUpperCase() || "U";

  const handleEdit = () => {
    setInputValue(name);
    setError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setInputValue(name);
    setError(null);
  };

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (trimmed === name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onUpdateName(trimmed);
    if (result.status === "error") {
      setError(result.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setEditing(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const result = await signOutEnterpriseAccount();
    notify({ title: result.status === "success" ? "Signed out" : "Sign-out unavailable", message: result.message, tone: result.status === "success" ? "success" : "error" });
    if (result.status === "success") router.replace("/login");
    setLoggingOut(false);
  };

  return (
    <main className="bg-[#faf8ff] p-8 text-[#191b23] min-h-svh">
      <div className="mx-auto max-w-[700px]">
        <section className="mb-12">
          <div className="flex items-end gap-6 mb-6">
            <div className="relative group shrink-0">
              <div className="size-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                <div className="size-full bg-[linear-gradient(135deg,#dbe1ff,#9cf2e8)] flex items-center justify-center text-4xl font-bold text-[#004ac6] group-hover:scale-105 transition-transform duration-500">
                  {initial}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 bg-[#004ac6] text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all" type="button" aria-label="Edit profile image">
                <Edit3 className="size-[18px]" />
              </button>
            </div>
            <div className="pb-2">
              <h2 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23] mb-1">{name}</h2>
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 bg-[#dbe1ff] text-[#003ea8] text-xs leading-4 font-medium rounded uppercase tracking-wider">{role}</span>
                <span className="text-[#434655] text-base leading-6">{email}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl leading-8 font-semibold tracking-[-0.01em] text-[#191b23]">Personal Info</h3>
              {!editing && (
                <button onClick={handleEdit} className="text-[#004ac6] text-sm leading-5 font-semibold tracking-[0.05em] hover:underline" type="button">Edit Info</button>
              )}
            </div>
            <div className="space-y-8">
              {editing ? (
                <div className="space-y-2">
                  <label className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#434655]">Full Name</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white border border-[#c3c6d7] rounded-lg text-[#191b23] text-base leading-6 outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-colors"
                      autoFocus
                      disabled={saving}
                    />
                    <button onClick={handleSave} disabled={saving} className="p-2 text-[#006a63] hover:bg-[#e0f5f2] rounded-lg transition-colors disabled:opacity-50" type="button" aria-label="Save">
                      <Check className="size-5" />
                    </button>
                    <button onClick={handleCancel} disabled={saving} className="p-2 text-[#8b1e1e] hover:bg-[#ffe8e8] rounded-lg transition-colors disabled:opacity-50" type="button" aria-label="Cancel">
                      <X className="size-5" />
                    </button>
                  </div>
                  {error && <p className="text-xs leading-4 text-[#8b1e1e]">{error}</p>}
                </div>
              ) : (
                <ProfileField label="Full Name">{name}</ProfileField>
              )}
              <ProfileField label="Email Address" verified>{email}</ProfileField>
            </div>
          </div>

          <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-3 text-[#8b1e1e] text-sm leading-5 font-semibold tracking-[0.05em] hover:bg-[#ffe8e8] px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              type="button"
            >
              <LogOut className="size-5" />
              {loggingOut ? "Signing out..." : "Log out"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfileField({ label, children, verified = false }: { label: string; children: React.ReactNode; verified?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm leading-5 font-semibold tracking-[0.05em] text-[#434655]">{label}</label>
      <div className="w-full px-4 py-2 bg-[#f3f3fe] border border-[#c3c6d7] rounded-lg text-[#191b23] text-base leading-6 flex items-center justify-between min-h-[40px]">
        <span>{children}</span>
        {verified && <CheckCircle2 className="size-[18px] text-[#006a63]" aria-label="Verified email" />}
      </div>
    </div>
  );
}
