import { ApiKeysClient } from "./api-keys-client";

export const metadata = { title: "API Keys | ColdReach AI" };

export default async function ApiKeysPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  return <ApiKeysClient workspaceId={workspaceId} />;
}
