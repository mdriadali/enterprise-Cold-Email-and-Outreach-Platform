"use client";

import { usePathname } from "next/navigation";
import { ControlPanelShell, type ControlPanelNavigationItem } from "@repo/ui/control-panel-shell";

export function ActiveShell({
  children,
  navigation,
  user,
  sidebarFooter,
  sidebarAccount,
}: {
  children: React.ReactNode;
  navigation?: ControlPanelNavigationItem[];
  user?: { name: string; email: string };
  sidebarFooter?: React.ReactNode;
  sidebarAccount?: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <ControlPanelShell activePath={pathname} navigation={navigation} user={user} sidebarFooter={sidebarFooter} sidebarAccount={sidebarAccount}>
      {children}
    </ControlPanelShell>
  );
}
