import { LeadsClient } from "./leads-client";

export const metadata = { title: "Leads Management | ColdReach AI" };

export default async function LeadsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  return <LeadsClient workspaceId={workspaceId} />;
}
