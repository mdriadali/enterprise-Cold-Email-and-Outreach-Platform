"use server";

import { callApi } from "./api-client";
import type { AuthenticationState } from "../../states/auth.states";

export async function resetPasswordAction(params: { email: string; token: string; password: string }): Promise<AuthenticationState> {
  const result = await callApi({ method: "POST", url: "auth/reset-password", data: params });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  if (!payload || !("sucess" in payload) || payload.sucess !== true) {
    return { status: "error", message: (payload?.message as string) ?? (payload?.massage as string) ?? "Password reset failed." };
  }

  return { status: "success", message: "Your password has been reset. You can now sign in." };
}
