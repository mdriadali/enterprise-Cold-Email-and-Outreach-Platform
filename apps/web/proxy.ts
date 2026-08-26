import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HTTP_SERVER_URL =
  process.env.HTTP_SERVER_URL ?? "http://localhost:4000/api/v1";

function decodeJwt(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    return JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);

  if (!decoded?.exp) return true;

  return decoded.exp * 1000 <= Date.now();
}

function extractAccessTokenFromCookies(setCookies: string[]): string | null {
  for (const cookie of setCookies) {
    const parsed = parseSetCookie(cookie);
    if (parsed?.name === "accessToken") {
      return parsed.value;
    }
  }
  return null;
}

async function isUserMemberOfWorkspace(
  accessToken: string,
  workspaceId: string
): Promise<boolean> {
  try {
    const url = new URL("user/profile", HTTP_SERVER_URL).toString();

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${encodeURIComponent(accessToken)}`,
      },
    });

    if (!res.ok) return false;

    const json = await res.json();
    const memberships: { workspaceId: string }[] = json?.data?.workspaceMember ?? [];
    return memberships.some((m) => m.workspaceId === workspaceId);
  } catch {
    return false;
  }
}

function parseSetCookie(
  cookie: string
): {
  name: string;
  value: string;
  maxAge?: number;
} | null {
  const [pair = ""] = cookie.split(";");

  const sep = pair.indexOf("=");

  if (sep === -1) return null;

  const name = pair.slice(0, sep).trim();

  if (name !== "accessToken" && name !== "refreshToken") {
    return null;
  }

  const value = pair.slice(sep + 1);

  const maxAgeMatch = cookie.match(/;\s*Max-Age\s*=\s*(\d+)/i);

  return {
    name,
    value,
    maxAge: maxAgeMatch ? Number(maxAgeMatch[1]) : undefined,
  };
}

function applyCookies(response: NextResponse, cookies: string[]) {
  for (const cookie of cookies) {
    const parsed = parseSetCookie(cookie);

    if (!parsed) continue;

    response.cookies.set(parsed.name, parsed.value, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      ...(parsed.maxAge !== undefined && {
        maxAge: parsed.maxAge,
      }),
    });
  }
}

async function tryRefresh(request: NextRequest): Promise<{
  accessToken: string;
  setCookies: string[];
} | null> {

  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return null;
  }

  try {
    const refreshUrl = new URL(
      "auth/refresh",
      HTTP_SERVER_URL
    ).toString();

    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
        "Content-Type": "application/json",
      },
    });
  console.log("Refresh status:", res.status);
    if (!res.ok) {
      return null;
    }

    const setCookies = res.headers.getSetCookie?.() ?? [];
    console.log("Set-Cookie:", res.headers.getSetCookie?.());

    for (const cookie of setCookies) {
      const parsed = parseSetCookie(cookie);

      if (parsed?.name === "accessToken") {
        return {
          accessToken: parsed.value,
          setCookies,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {

  console.log({
    accessToken: !!request.cookies.get("accessToken")?.value,
    refreshToken: !!request.cookies.get("refreshToken")?.value,
  });



  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const selectedWorkspaceId = request.cookies.get("selectedWorkspaceId")?.value;
  const savedWorkspaceUrl = selectedWorkspaceId ? `/workspace/${selectedWorkspaceId}` : null;

  function resolveLanding(): string {
    return savedWorkspaceUrl ?? "/workspaces";
  }

  // LOGIN / REGISTER
  if (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/register" ||
    pathname === "/forgot-password"
  ) {
    if (accessToken && !isTokenExpired(accessToken)) {
      let landing = "/workspaces";
      if (selectedWorkspaceId) {
        const hasAccess = await isUserMemberOfWorkspace(accessToken, selectedWorkspaceId);
        landing = hasAccess ? savedWorkspaceUrl! : "/workspaces";
      }
      return NextResponse.redirect(new URL(landing, request.url));
    }

    const refreshed = await tryRefresh(request);

    if (refreshed) {
      const refreshedAccessToken = extractAccessTokenFromCookies(refreshed.setCookies);
      let landing = "/workspaces";
      if (selectedWorkspaceId && refreshedAccessToken) {
        const hasAccess = await isUserMemberOfWorkspace(refreshedAccessToken, selectedWorkspaceId);
        landing = hasAccess ? savedWorkspaceUrl! : "/workspaces";
      }
      const response = NextResponse.redirect(new URL(landing, request.url));
      applyCookies(response, refreshed.setCookies);
      return response;
    }

    return NextResponse.next();
  }

  // VERIFY EMAIL / RESET PASSWORD (public — must process the link even when signed in)
  if (
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email")
  ) {
    return NextResponse.next();
  }

  // ROOT - redirect to saved workspace or workspaces list
  if (pathname === "/") {
    if (accessToken && !isTokenExpired(accessToken)) {
      let landing = "/workspaces";
      if (selectedWorkspaceId) {
        const hasAccess = await isUserMemberOfWorkspace(accessToken, selectedWorkspaceId);
        landing = hasAccess ? savedWorkspaceUrl! : "/workspaces";
      }
      return NextResponse.redirect(new URL(landing, request.url));
    }
    // try refresh for root too
    if (refreshToken) {
      const refreshed = await tryRefresh(request);
      if (refreshed) {
        const refreshedAccessToken = extractAccessTokenFromCookies(refreshed.setCookies);
        let landing = "/workspaces";
        if (selectedWorkspaceId && refreshedAccessToken) {
          const hasAccess = await isUserMemberOfWorkspace(refreshedAccessToken, selectedWorkspaceId);
          landing = hasAccess ? savedWorkspaceUrl! : "/workspaces";
        }
        const response = NextResponse.redirect(new URL(landing, request.url));
        applyCookies(response, refreshed.setCookies);
        return response;
      }
    }
    // fall through to refresh/login logic below
  }

  // VALID ACCESS TOKEN
  if (accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.next();
  }

  // NO REFRESH TOKEN
  if (!refreshToken) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // REFRESH ACCESS TOKEN
  const refreshed = await tryRefresh(request);

  if (refreshed) {
    const headers = new Headers(request.headers);

    headers.set("x-refreshed-token", refreshed.accessToken);

    const response = NextResponse.next({
      request: {
        headers,
      },
    });

    applyCookies(response, refreshed.setCookies);

    return response;
  }

  // REFRESH FAILED
  const loginUrl = new URL("/login", request.url);

  loginUrl.searchParams.set("redirect", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};