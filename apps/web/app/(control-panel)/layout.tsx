import { SidebarAccount } from "../src/components/auth/sidebar-account";
import { ActiveShell } from "./active-shell";

export default async function ControlPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ActiveShell sidebarAccount={<SidebarAccount />}>{children}</ActiveShell>;
}
