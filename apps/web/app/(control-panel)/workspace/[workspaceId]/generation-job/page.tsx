import { notFound } from "next/navigation";
import { getWorkspaceInfo } from "../../../../src/actions/workspace/workspace-info";
import { GenerationJobClient } from "./generation-job-client";

export const metadata = { title: "Generation Jobs | ColdReach AI" };

export default async function GenerationJobPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const result = await getWorkspaceInfo(workspaceId);

  if (result.status === "error") notFound();

  const { info } = result.data;

  return <GenerationJobClient workspaceId={workspaceId} jobs={info.generationJob} jobCount={info._count.generationJob} />;
}
