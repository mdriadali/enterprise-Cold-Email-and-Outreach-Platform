"use server";

import { callApi } from "./api-client";
import type { AuthenticationState } from "../../states/auth.states";

export async function verifyEmailAction(params: { email: string; token: string }): Promise<AuthenticationState> {
  const result = await callApi({ method: "POST", url: "auth/verify-email", data: params });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  if (!payload || !("sucess" in payload) || payload.sucess !== true) {
    return { status: "error", message: (payload?.message as string) ?? (payload?.massage as string) ?? "Email verification failed." };
  }

  return { status: "success", message: "Your email has been verified." };
}
