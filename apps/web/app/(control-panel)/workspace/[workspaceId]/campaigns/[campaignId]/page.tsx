import { notFound, redirect } from "next/navigation";
import { getCampaign } from "../../../../../src/actions/workspace/get-campaign";
import { CampaignDetailClient } from "./campaign-detail-client";

export const metadata = { title: "Campaign Detail | ColdReach AI" };

export default async function CampaignDetailPage({ params }: { params: Promise<{ workspaceId: string; campaignId: string }> }) {
  const { workspaceId, campaignId } = await params;

  const result = await getCampaign(workspaceId, campaignId);

  if (result.status === "error") {
    if (result.code === "NOT_WORKSPACE_MEMBER") redirect("/workspaces");
    notFound();
  }

  return <CampaignDetailClient workspaceId={workspaceId} campaign={result.data} />;
}
