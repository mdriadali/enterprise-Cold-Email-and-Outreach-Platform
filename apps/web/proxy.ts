import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HTTP_SERVER_URL = process.env.HTTP_SERVER_URL ?? "http://localhost:4000/api/v1";

function decodeJwt(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/login" || pathname.startsWith("/login/") ||
    pathname === "/register" || pathname.startsWith("/register/") ||
    pathname.startsWith("/_next") || pathname === "/favicon.ico"
  ) return NextResponse.next();

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Token valid → proceed
  if (accessToken && !isTokenExpired(accessToken)) return NextResponse.next();

  // Token expired/missing but no refresh token → redirect
  if (!refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Try refresh synchronously so current request gets the new token
  try {
    const refreshUrl = new URL("auth/refresh", HTTP_SERVER_URL).toString();
    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const setCookies = res.headers.getSetCookie?.() ?? [];
      let newAccessToken: string | undefined;

      const response = NextResponse.next();
      for (const cookie of setCookies) {
        const [pair = ""] = cookie.split(";");
        const sep = pair.indexOf("=");
        if (sep === -1) continue;
        const name = pair.slice(0, sep).trim();
        const value = pair.slice(sep + 1);
        if (name === "accessToken" || name === "refreshToken") {
          response.cookies.set(name, value, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: false,
          });
          if (name === "accessToken") newAccessToken = value;
        }
      }

      // Forward new token to the current request handler
      if (newAccessToken) {
        const reqHeaders = new Headers(request.headers);
        reqHeaders.set("x-refreshed-token", newAccessToken);
        return NextResponse.next({ request: { headers: reqHeaders } });
      }

      return response;
    }
  } catch {
    // Refresh network error → redirect to login
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|register).*)"],
};
