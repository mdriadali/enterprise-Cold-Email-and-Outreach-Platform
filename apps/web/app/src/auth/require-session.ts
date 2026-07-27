import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function hasActiveSession() {
  return Boolean((await cookies()).get("accessToken")?.value);
}

/** Server-side route guard. Authentication state never reaches client components. */
export async function requireSession() {
  if (!(await hasActiveSession())) redirect("/login");
}
