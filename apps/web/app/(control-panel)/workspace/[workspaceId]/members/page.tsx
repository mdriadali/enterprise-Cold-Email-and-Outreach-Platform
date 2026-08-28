import { MembersClient } from "./members-client";

export const metadata = { title: "Team Members | ColdReach AI" };

export default async function MembersPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  return <MembersClient workspaceId={workspaceId} />;
}
