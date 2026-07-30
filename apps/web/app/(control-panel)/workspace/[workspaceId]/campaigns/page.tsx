import { notFound } from "next/navigation";
import { getWorkspaceInfo } from "../../../../src/actions/workspace/workspace-info";
import { CampaignsClient } from "./campaigns-client";

export const metadata = { title: "Campaigns | ColdReach AI" };

export default async function CampaignsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const result = await getWorkspaceInfo(workspaceId);

  if (result.status === "error") {
    notFound();
  }

  const { info, limits } = result.data;

  return <CampaignsClient info={info} limits={limits} />;
}
