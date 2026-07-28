"use server";

import axios from "axios";
import { webEnv } from "@repo/env/web-env";

import type { AuthenticationState } from "../../states/auth.states";
import { persistSessionCookies } from "./session";
import { signInSchema } from "../../components/auth/auth-schemas";

import { extractMessage } from "./shared";

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
      return { status: "error", message: extractMessage(response.data) ?? "Authentication failed." };
    }
    await persistSessionCookies(response.headers["set-cookie"]);
    return { status: "success", message: "You are signed in successfully." };
  } catch (error: unknown) {
    return { status: "error", message: extractMessage(axios.isAxiosError(error) ? error.response?.data : error) ?? "Authentication failed." };
  }
}

function isSuccessfulResponse(payload: unknown): boolean {
  return typeof payload === "object" && payload !== null && "sucess" in payload && payload.sucess === true;
}
