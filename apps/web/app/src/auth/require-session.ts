import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { callApi } from "../actions/auth/api-client";
import type { Profile } from "../actions/auth/profile";

export async function hasActiveSession() {
  return Boolean((await cookies()).get("accessToken")?.value);
}

/** Server-side route guard. Authentication state never reaches client components. */
export async function requireSession() {
  if (!(await hasActiveSession())) redirect("/login");
}

/** Server-side email verification guard. Redirects to pending page if email is not verified. */
export async function requireEmailVerification() {
  const result = await callApi({ method: "GET", url: "user/profile" });
  if (result.status === "error") return;

  const data = (result.data as Record<string, unknown>)?.data as Profile | undefined;
  if (data && data.emailVerifiedAt === null) {
    redirect("/verify-email/pending");
  }
}
