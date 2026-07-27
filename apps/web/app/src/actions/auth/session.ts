"use server";

import { cookies } from "next/headers";

/** Copies the HTTP service session cookies into the browser response from a server action. */
export async function persistSessionCookies(setCookieHeader: string[] | undefined) {
  if (!setCookieHeader) return;
  const cookieStore = await cookies();
  for (const rawCookie of setCookieHeader) {
    const [pair = ""] = rawCookie.split(";");
    const separator = pair.indexOf("=");
    if (separator === -1) continue;
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1);
    if (name !== "accessToken" && name !== "refreshToken") continue;
    cookieStore.set({ name, value, httpOnly: true, sameSite: "lax", path: "/" });
  }
}
