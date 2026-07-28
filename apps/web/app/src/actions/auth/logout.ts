"use server";

import { cookies } from "next/headers";
import { callApi } from "./api-client";

export type LogoutState = { status: "success" | "error"; message: string };

export async function signOutEnterpriseAccount(): Promise<LogoutState> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return { status: "error", message: "Your session has already ended." };

  const result = await callApi({ method: "POST", url: "auth/logout", data: {} });
  if (result.status === "error" && result.message === "Your session has expired.") {
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return { status: "success", message: "Your session has expired." };
  }
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  if (!payload || !("sucess" in payload) || payload.sucess !== true) {
    return { status: "error", message: (payload?.message as string) ?? (payload?.massage as string) ?? "Sign out failed." };
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  return { status: "success", message: "You have been signed out." };
}
