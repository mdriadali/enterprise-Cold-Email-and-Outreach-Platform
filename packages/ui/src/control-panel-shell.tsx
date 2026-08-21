"use client";

import type { ComponentType, ReactNode } from "react";
import {
  BarChart3,
  Bell,
  HelpCircle,
  Key,
  LayoutDashboard,
  Mail,
  MoreVertical,
  Phone,
  Rocket,
  Send,
  Server,
  Settings,
  Users,
  UserPlus,
  Astroid
} from "lucide-react";

export type ControlPanelNavigationItem = {
  href: string;
  label: string;
  icon: "dashboard" | "members" | "generation" | "campaigns" | "campaign-emails" | "leads" | "analytics" | "settings" | "api-keys" | "smtp";
};

type ControlPanelShellProps = {
  children: ReactNode;
  activePath: string;
  navigation?: ControlPanelNavigationItem[];
  user?: { name: string; email: string };
  sidebarFooter?: ReactNode;
  sidebarAccount?: ReactNode;
  workspaceId?: string;
  workspaceName?: string;
};

const icons: Record<ControlPanelNavigationItem["icon"], ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  members: Users,
  generation: Astroid,
  campaigns: Send,
  "campaign-emails": Mail,
  leads: Users,
  analytics: BarChart3,
  "api-keys": Key,
  smtp: Server,
  settings: Settings,
};

const defaultNavigation: ControlPanelNavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/members", label: "Members", icon: "members" },
  { href: "/generation-job", label: "Generation Job", icon: "generation" },
  { href: "/campaigns", label: "Campaigns", icon: "campaigns" },
  { href: "/campaigns-emails", label: "Campaign Emails", icon: "campaign-emails" },
  { href: "/leads", label: "Leads", icon: "leads" },
  { href: "/api-keys", label: "API Keys", icon: "api-keys" },
  { href: "/smtp", label: "SMTP Accounts", icon: "smtp" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

function prefixedHref(href: string, workspaceId?: string) {
  if (!workspaceId) return href;
  if (href === "/dashboard") return `/workspace/${workspaceId}`;
  return `/workspace/${workspaceId}${href}`;
}

/** Shared authenticated application shell. Keep route content in the app, not this component. */
export function ControlPanelShell({ children, activePath, navigation = defaultNavigation, user = { name: "Marcus Sterling", email: "m.sterling@enterprise.com" }, sidebarFooter, sidebarAccount, workspaceId}: Readonly<ControlPanelShellProps>) {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-[#4f46e5] font-[Inter,Arial,sans-serif] text-white">
      <aside className="hidden w-[260px] shrink-0 flex-col py-6 text-white/90 lg:flex">
        <div className="mb-6 flex flex-col gap-2 px-8">
          <a href={prefixedHref("/dashboard", workspaceId)} className="flex items-center gap-4" aria-label="ColdReach AI dashboard">
            <span className="grid size-8 place-items-center rounded bg-white/20 backdrop-blur-md"><Rocket className="size-5 fill-current" /></span>
            <span className="text-2xl font-semibold tracking-tight text-white">ColdReach AI</span>
          </a>
          {workspaceId ? (
            <a href="/workspaces" className="flex items-center gap-2 text-white/60 text-xs tracking-wider hover:text-white transition-colors">
              <LayoutDashboard className="size-3" />
              All Workspaces
            </a>
          ) : null}
        </div>
        <nav className="flex-1 space-y-1 px-4" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = icons[item.icon];
            const href = prefixedHref(item.href, workspaceId);
            const active = activePath === href;
            return <a className={`relative flex items-center gap-4 rounded-lg px-4 py-2 text-sm font-semibold tracking-[.05em] transition-colors hover:bg-white/10 ${active ? "bg-white/[.15] text-white after:absolute after:right-0 after:top-1/2 after:h-6 after:w-[3px] after:-translate-y-1/2 after:rounded-l after:bg-white" : ""}`} href={href} key={item.href}><Icon className="size-5" />{item.label}</a>;
          })}
        </nav>
        <div className="mt-auto px-4">
          {sidebarAccount ?? <><button className="flex w-full items-center gap-2 rounded-xl p-2 text-left transition-colors hover:bg-white/10" type="button"><span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/20 text-sm font-bold text-white">{user.name.slice(0, 1)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold tracking-[.05em] text-white">{user.name}</span><span className="block truncate text-[11px] text-white/50">{user.email}</span></span><MoreVertical className="size-5 text-white/40" /></button>{sidebarFooter ? <div className="mt-3 border-t border-white/10 pt-3">{sidebarFooter}</div> : null}</>}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-end px-5 text-white sm:px-8">
          
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="hidden items-center gap-6 text-white/70 sm:flex"><HelpCircle className="size-[22px]" /><Phone className="size-[22px]" /><Mail className="size-[22px]" /><span className="relative"><Bell className="size-[22px]" /><i className="absolute -right-1 -top-1 size-2 rounded-full border-2 border-[#4f46e5] bg-[#ba1a1a]" /></span></div>
            <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold tracking-[.05em] text-[#4f46e5] shadow-lg transition hover:bg-[#faf8ff] active:scale-95 sm:px-6" type="button"><UserPlus className="size-5" /><span className="hidden sm:inline">Invite users</span></button>
          </div>
        </header>
        <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-tl-[40px] bg-white text-[#191b23] shadow-[0_-8px_30px_rgb(0_0_0_/_0.12)]">{children}</main>
      </div>
    </div>
  );
}
