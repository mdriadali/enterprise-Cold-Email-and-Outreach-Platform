import { notFound } from "next/navigation";
import { getWorkspaceInfo } from "../../../../src/actions/workspace/workspace-info";
import { ApiKeysClient } from "./api-keys-client";

export const metadata = { title: "API Keys | ColdReach AI" };

export default async function ApiKeysPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const result = await getWorkspaceInfo(workspaceId);

  if (result.status === "error") notFound();

  const { info } = result.data;

  return <ApiKeysClient workspaceId={workspaceId} keys={info.AiApiKeys ?? []} />;
}
