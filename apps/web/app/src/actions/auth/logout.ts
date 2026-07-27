"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { webEnv } from "@repo/env/web-env";

export type LogoutState = { status: "success" | "error"; message: string };

export async function signOutEnterpriseAccount(): Promise<LogoutState> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return { status: "error", message: "Your session has already ended." };

  try {
    const response = await axios.post(new URL("auth/logout", webEnv.HTTP_SERVER_URL).toString(), {}, {
      headers: { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` },
    });
    const payload = response.data;
    if (typeof payload !== "object" || payload === null || !("sucess" in payload) || payload.sucess !== true) {
      return { status: "error", message: "We couldn't sign you out. Please try again." };
    }
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return { status: "success", message: "You have been signed out." };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      return { status: "success", message: "Your expired session has been cleared." };
    }
    return { status: "error", message: "We couldn't sign you out. Please try again." };
  }
}
