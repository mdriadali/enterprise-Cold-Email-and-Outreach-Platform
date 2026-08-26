import { notFound, redirect } from "next/navigation";
import { getWorkspaceInfo } from "../../../src/actions/workspace/workspace-info";
import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Workspace Dashboard | ColdReach AI" };

const planNames: Record<string, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ULTRA: "Ultra",
};

export default async function WorkspaceDashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const result = await getWorkspaceInfo(workspaceId);

  if (result.status === "error") {
    if (result.code === "NOT_WORKSPACE_MEMBER") redirect("/workspaces");
    notFound();
  }

  const { info, limits } = result.data;
  const planDisplayName = planNames[info.subscription] ?? info.subscription;

  return <DashboardClient info={info} limits={limits} planDisplayName={planDisplayName} />;
}
