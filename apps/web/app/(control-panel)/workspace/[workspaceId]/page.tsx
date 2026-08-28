import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Workspace Dashboard | ColdReach AI" };

export default async function WorkspaceDashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  return <DashboardClient workspaceId={workspaceId} />;
}
