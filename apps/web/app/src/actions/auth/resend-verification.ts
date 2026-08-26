"use server";

import { callApi } from "./api-client";

export type ResendVerificationResult = { status: "success"; message: string } | { status: "error"; message: string };

export async function resendVerificationEmail(): Promise<ResendVerificationResult> {
  const result = await callApi({ method: "POST", url: "auth/resend-verification" });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  if (!payload || !("sucess" in payload) || payload.sucess !== true) {
    return { status: "error", message: (payload?.message as string) ?? "Failed to resend verification email." };
  }

  return { status: "success", message: "Verification email sent. Please check your inbox." };
}
