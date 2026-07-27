"use server";

import axios from "axios";
import { webEnv } from "@repo/env/web-env";

import type { AuthenticationState } from "../../states/auth.states";
import { persistSessionCookies } from "./session";
import { signInSchema } from "../../components/auth/auth-schemas";

export async function signInEnterpriseAccount(formData: FormData): Promise<AuthenticationState> {
  const validation = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: validation.error.flatten().fieldErrors };
  }

  try {
    const response = await axios.post(new URL("auth/login", webEnv.HTTP_SERVER_URL).toString(), validation.data);
    if (!isSuccessfulResponse(response.data)) {
      return { status: "error", message: "We couldn't sign you in. Please try again." };
    }
    await persistSessionCookies(response.headers["set-cookie"]);
    return { status: "success", message: "You are signed in successfully." };
  } catch (error: unknown) {
    return { status: "error", message: getServerErrorMessage(error) ?? "We couldn't reach the sign-in service. Please try again." };
  }
}

function isSuccessfulResponse(payload: unknown): boolean {
  return typeof payload === "object" && payload !== null && "sucess" in payload && payload.sucess === true;
}

function getServerErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data !== "object" || data === null) return null;
  const message = "message" in data ? data.message : "massage" in data ? data.massage : null;
  return typeof message === "string" && message.trim() ? message.trim() : null;
}
