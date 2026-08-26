import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasActiveSession, requireEmailVerification } from "./src/auth/require-session";

export default async function Home() {
  const authed = await hasActiveSession();
  if (!authed) redirect("/login");

  await requireEmailVerification();

  const ws = (await cookies()).get("selectedWorkspaceId")?.value;
  redirect(ws ? `/workspace/${ws}` : "/workspaces");
}
