"use server";

import { callApi } from "./api-client";
import type { AuthenticationState } from "../../states/auth.states";
import { signInSchema } from "../../components/auth/auth-schemas";

export async function signInEnterpriseAccount(formData: FormData): Promise<AuthenticationState> {
  const validation = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: validation.error.flatten().fieldErrors };
  }

  const result = await callApi({ method: "POST", url: "auth/login", data: validation.data });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  if (!payload || !("sucess" in payload) || payload.sucess !== true) {
    return { status: "error", message: (payload?.message as string) ?? (payload?.massage as string) ?? "Authentication failed." };
  }

  return { status: "success", message: "You are signed in successfully." };
}
