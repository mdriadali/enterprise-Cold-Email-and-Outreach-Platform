import { notFound } from "next/navigation";
import { getWorkspaceInfo } from "../../../../src/actions/workspace/workspace-info";
import { CampaignEmailsHomeClient } from "./campaign-emails-client";

export const metadata = { title: "Campaign Emails | ColdReach AI" };

export default async function CampaignEmailsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const result = await getWorkspaceInfo(workspaceId);

  if (result.status === "error") notFound();

  const { info } = result.data;

  return <CampaignEmailsHomeClient workspaceId={workspaceId} campaigns={info.campaign} />;
}
