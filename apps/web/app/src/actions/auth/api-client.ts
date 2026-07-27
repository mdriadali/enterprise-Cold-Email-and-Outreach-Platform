import axios, { type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import { webEnv } from "@repo/env/web-env";
import { persistSessionCookies } from "./session";

export type ApiResult = { status: "success"; data: unknown; headers: Record<string, string | string[] | undefined> } | { status: "error"; message: string };

export async function callApi(config: AxiosRequestConfig): Promise<ApiResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshTokenValue = cookieStore.get("refreshToken")?.value;

  if (!accessToken) return { status: "error", message: "Your session has expired." };

  const url = config.url?.startsWith("http") ? config.url : new URL(config.url ?? "", webEnv.HTTP_SERVER_URL).toString();

  const buildHeaders = (token: string) => {
    const cookie = `accessToken=${encodeURIComponent(token)}${refreshTokenValue ? `; refreshToken=${encodeURIComponent(refreshTokenValue)}` : ""}`;
    return { ...config.headers, Cookie: cookie };
  };

  try {
    const response = await axios({ ...config, url, headers: buildHeaders(accessToken) });
    return { status: "success", data: response.data, headers: response.headers as Record<string, string | string[] | undefined> };
  } catch (error: unknown) {
    if (!axios.isAxiosError(error)) return { status: "error", message: "Something went wrong." };

    if (error.response?.status === 401 && refreshTokenValue) {
      try {
        const refreshResponse = await axios.post(
          new URL("auth/refresh", webEnv.HTTP_SERVER_URL).toString(),
          {},
          { headers: { Cookie: `refreshToken=${encodeURIComponent(refreshTokenValue)}` } },
        );
        await persistSessionCookies(refreshResponse.headers["set-cookie"]);

        const newAccessToken = (await cookies()).get("accessToken")?.value;
        if (newAccessToken) {
          const retry = await axios({ ...config, url, headers: buildHeaders(newAccessToken) });
          return { status: "success", data: retry.data, headers: retry.headers as Record<string, string | string[] | undefined> };
        }
      } catch {
        // refresh failed
      }
    }

    const data = error.response?.data;
    const msg = data && typeof data === "object"
      ? (("message" in data ? (data as Record<string, unknown>).message : "massage" in data ? (data as Record<string, unknown>).massage : null) as string | null)
      : typeof data === "string" ? data : null;
    return { status: "error", message: msg ?? "Something went wrong." };
  }
}
