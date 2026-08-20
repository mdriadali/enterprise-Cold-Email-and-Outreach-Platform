"use server";

import { callApi } from "./api-client";
import type { AuthenticationState } from "../../states/auth.states";

export async function forgotPasswordAction(email: string): Promise<AuthenticationState> {
  const result = await callApi({ method: "POST", url: "auth/forgot-password", data: { email } });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  if (!payload || !("sucess" in payload) || payload.sucess !== true) {
    return { status: "error", message: (payload?.message as string) ?? (payload?.massage as string) ?? "Request failed." };
  }

  return { status: "success", message: "If an account exists for this email, a reset link has been sent." };
}
