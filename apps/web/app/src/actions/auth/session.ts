"use server";

import { cookies } from "next/headers";

function parseSetCookie(cookie: string) {
  const [pair = ""] = cookie.split(";");
  const sep = pair.indexOf("=");

  if (sep === -1) return null;

  const name = pair.slice(0, sep).trim();
  const value = pair.slice(sep + 1);

  const maxAgeMatch = cookie.match(/;\s*Max-Age\s*=\s*(\d+)/i);

  return {
    name,
    value,
    maxAge: maxAgeMatch ? Number(maxAgeMatch[1]) : undefined,
  };
}

export async function persistSessionCookies(
  setCookieHeader: string[] | undefined
) {
  if (!setCookieHeader) return;

  const cookieStore = await cookies();

  for (const rawCookie of setCookieHeader) {
    const parsed = parseSetCookie(rawCookie);

    if (!parsed) continue;

    if (
      parsed.name !== "accessToken" &&
      parsed.name !== "refreshToken"
    ) {
      continue;
    }

    cookieStore.set({
      name: parsed.name,
      value: parsed.value,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      ...(parsed.maxAge !== undefined && {
        maxAge: parsed.maxAge,
      }),
    });
  }
}