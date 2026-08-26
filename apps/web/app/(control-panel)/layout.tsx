import { requireSession, requireEmailVerification } from "../src/auth/require-session";
import { SidebarAccount } from "../src/components/auth/sidebar-account";
import { ActiveShell } from "./active-shell";

export default async function ControlPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireSession();
  await requireEmailVerification();

  return <ActiveShell sidebarAccount={<SidebarAccount />}>{children}</ActiveShell>;
}
