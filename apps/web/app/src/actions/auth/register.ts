"use server";

import { callApi } from "./api-client";
import { RegistrationState } from "../../states/auth.states";
import { registrationSchema } from "../../components/auth/auth-schemas";

export async function registerEnterpriseAccount(formData: FormData): Promise<RegistrationState> {
  const validation = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    terms: formData.get("terms") === "on",
  });

  if (!validation.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: validation.error.flatten().fieldErrors };
  }

  const { name, email, password } = validation.data;

  const result = await callApi({ method: "POST", url: "auth/register", data: { name, email, password } });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  if (!payload || !("sucess" in payload) || payload.sucess !== true) {
    return { status: "error", message: (payload?.message as string) ?? (payload?.massage as string) ?? "Registration failed." };
  }

  return { status: "success" };
}
