import { notFound, redirect } from "next/navigation";
import { getWorkspaceInfo } from "../../../../src/actions/workspace/workspace-info";
import { LeadsClient } from "./leads-client";

export const metadata = { title: "Leads Management | ColdReach AI" };

export default async function LeadsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const result = await getWorkspaceInfo(workspaceId);

  if (result.status === "error") {
    if (result.code === "NOT_WORKSPACE_MEMBER") redirect("/workspaces");
    notFound();
  }

  const { info } = result.data;

  return <LeadsClient workspaceId={workspaceId} jobs={info.generationJob} />;
}
