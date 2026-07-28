import axios, { type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import { webEnv } from "@repo/env/web-env";
import { persistSessionCookies } from "./session";

export type ApiResult = { status: "success"; data: unknown } | { status: "error"; message: string };

async function getCookieHeader() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshTokenValue = cookieStore.get("refreshToken")?.value;
  const parts: string[] = [];
  if (accessToken) parts.push(`accessToken=${encodeURIComponent(accessToken)}`);
  if (refreshTokenValue) parts.push(`refreshToken=${encodeURIComponent(refreshTokenValue)}`);
  return parts.join("; ");
}

export async function callApi(config: AxiosRequestConfig): Promise<ApiResult> {
  const cookie = await getCookieHeader();

  const url = config.url?.startsWith("http") ? config.url : new URL(config.url ?? "", webEnv.HTTP_SERVER_URL).toString();

  try {
    const headers = cookie ? { ...config.headers, Cookie: cookie } : config.headers;
    const response = await axios({ ...config, url, headers });
    await persistSessionCookies(response.headers["set-cookie"]);
    return { status: "success", data: response.data };
  } catch (error: unknown) {
    if (!axios.isAxiosError(error)) return { status: "error", message: "Something went wrong." };

    const data = error.response?.data;
    const msg = data && typeof data === "object"
      ? (("message" in data ? (data as Record<string, unknown>).message : "massage" in data ? (data as Record<string, unknown>).massage : null) as string | null)
      : typeof data === "string" ? data : null;
    return { status: "error", message: msg ?? "Something went wrong." };
  }
}
