import { ControlPanelShell } from "@repo/ui/control-panel-shell";

import { requireSession } from "../src/auth/require-session";
import { SidebarAccount } from "../src/components/auth/sidebar-account";

export default async function ControlPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireSession();
  return <ControlPanelShell activePath="/editor" sidebarAccount={<SidebarAccount />}>{children}</ControlPanelShell>;
}
