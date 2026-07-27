"use client";

import { LogOut, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useNotification } from "@repo/ui/notification-provider";

import { signOutEnterpriseAccount } from "../../actions/auth/logout";

export function LogoutButton() {
  const router = useRouter();
  const { notify } = useNotification();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      const result = await signOutEnterpriseAccount();
      notify({ title: result.status === "success" ? "Signed out" : "Sign-out unavailable", message: result.message, tone: result.status === "success" ? "success" : "error" });
      if (result.status === "success") router.replace("/login");
    });
  }

  return <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold tracking-[.05em] text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-70" disabled={isPending} onClick={handleLogout} type="button">{isPending ? <LoaderCircle className="size-5 animate-spin" /> : <LogOut className="size-5" />}{isPending ? "Signing out..." : "Log out"}</button>;
}
