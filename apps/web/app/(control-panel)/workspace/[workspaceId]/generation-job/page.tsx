import { GenerationJobClient } from "./generation-job-client";

export const metadata = { title: "Generation Jobs | ColdReach AI" };

export default async function GenerationJobPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  return <GenerationJobClient workspaceId={workspaceId} />;
}
