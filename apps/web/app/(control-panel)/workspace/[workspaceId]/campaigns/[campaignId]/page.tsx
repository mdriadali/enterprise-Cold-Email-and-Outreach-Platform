import { PageError } from "@repo/ui/page-error";
import { getCampaign } from "../../../../../src/actions/workspace/get-campaign";
import { CampaignDetailClient } from "./campaign-detail-client";

export const metadata = { title: "Campaign Detail | ColdReach AI" };

export default async function CampaignDetailPage({ params }: { params: Promise<{ workspaceId: string; campaignId: string }> }) {
  const { workspaceId, campaignId } = await params;

  const result = await getCampaign(workspaceId, campaignId);

  if (result.status === "error") {
    return <PageError title="Campaign unavailable" message={result.message} />;
  }

  return <CampaignDetailClient workspaceId={workspaceId} campaign={result.data} />;
}
