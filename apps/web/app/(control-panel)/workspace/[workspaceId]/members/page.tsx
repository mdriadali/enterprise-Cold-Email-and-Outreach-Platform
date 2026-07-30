import { getWorkspaceInfo } from "../../../../src/actions/workspace/workspace-info";
import { notFound } from "next/navigation";
import { MembersClient } from "./members-client";

export const metadata = { title: "Team Members | ColdReach AI" };

export default async function MembersPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const result = await getWorkspaceInfo(workspaceId);
  if (result.status === "error") notFound();

  const { info, limits } = result.data;
  const owner = info.members.find((m) => m.user.id === info.ownerId);

  return <MembersClient info={info} limits={limits} owner={owner ?? null} />;
}
