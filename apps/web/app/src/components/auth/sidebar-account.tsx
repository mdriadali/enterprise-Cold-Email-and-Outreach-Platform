"use client";

import { LoaderCircle, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";

import { getCurrentUserProfile, type Profile } from "../../actions/auth/profile";
import { LogoutButton } from "./logout-button";

export function SidebarAccount() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;
    void getCurrentUserProfile().then((result) => {
      if (mounted && result.status === "success") setProfile(result.data);
    });
    return () => { mounted = false; };
  }, []);

  const name = profile?.name ?? "Loading profile";
  const email = profile?.email ?? "";

  return <section aria-label="Account">
    <a href="/profile" className="flex w-full items-center gap-2 rounded-xl p-2 text-left transition-colors hover:bg-white/10">
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/20 text-sm font-bold text-white">{profile ? name.slice(0, 1).toUpperCase() : <LoaderCircle className="size-4 animate-spin" />}</span>
      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold tracking-[.05em] text-white">{name}</span>{email ? <span className="block truncate text-[11px] text-white/50">{email}</span> : <span className="block h-3" />}</span>
      <MoreVertical className="size-5 text-white/40" />
    </a>
    <div className="mt-3 border-t border-white/10 pt-3"><LogoutButton /></div>
  </section>;
}
