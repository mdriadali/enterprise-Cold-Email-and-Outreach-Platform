import { requireSession, requireEmailVerification } from "../src/auth/require-session";
import { SidebarAccount } from "../src/components/auth/sidebar-account";
import { getCurrentUserProfile } from "../src/actions/auth/profile";
import { ActiveShell } from "./active-shell";

export default async function ControlPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireSession();
  await requireEmailVerification();

  const profile = await getCurrentUserProfile();
  const isAdmin = profile.status === "success" && profile.data.role === "ADMIN";

  return <ActiveShell sidebarAccount={<SidebarAccount />} isAdmin={isAdmin}>{children}</ActiveShell>;
}
