import { redirect } from "next/navigation";

import { hasActiveSession } from "./src/auth/require-session";

export default async function Home() {
  redirect((await hasActiveSession()) ? "/workspaces" : "/login");
}
