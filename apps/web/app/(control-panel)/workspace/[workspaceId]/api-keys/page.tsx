import { notFound } from "next/navigation";
import { findApiKeys } from "../../../../src/actions/workspace/find-api-keys";
import { ApiKeysClient } from "./api-keys-client";

export const metadata = { title: "API Keys | ColdReach AI" };

export default async function ApiKeysPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const result = await findApiKeys(workspaceId);

  if (result.status === "error") notFound();

  return <ApiKeysClient workspaceId={workspaceId} keys={result.data.apis} summary={result.data.summary} />;
}
