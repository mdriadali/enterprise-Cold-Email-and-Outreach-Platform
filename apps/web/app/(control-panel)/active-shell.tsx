"use client";

import { usePathname } from "next/navigation";
import { ControlPanelShell, type ControlPanelNavigationItem } from "@repo/ui/control-panel-shell";
import { useAppSelector } from "../src/states/hooks";

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
  const workspaceMatch = pathname.match(/^\/workspace\/([^/]+)/);
  const workspaceId = workspaceMatch?.[1];
  const selectedWorkspace = useAppSelector((s) => s.workspace.selectedWorkspace);
  return (
    <ControlPanelShell
      activePath={pathname}
      navigation={navigation}
      user={user}
      sidebarFooter={sidebarFooter}
      sidebarAccount={sidebarAccount}
      workspaceId={workspaceId}
      workspaceName={workspaceId ? selectedWorkspace?.name ?? "" : undefined}
    >
      {children}
    </ControlPanelShell>
  );
}
