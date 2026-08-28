import { CampaignsClient } from "./campaigns-client";

export const metadata = { title: "Campaigns | ColdReach AI" };

export default async function CampaignsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  return <CampaignsClient workspaceId={workspaceId} />;
}
