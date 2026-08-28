import { JobDetailClient } from "./job-detail-client";
import { getGenerationJob } from "../../../../../src/actions/workspace/get-generation-job";
import { PageError } from "@repo/ui/page-error";

export const metadata = { title: "Job Details | ColdReach AI" };

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; generationJobId: string }>;
}) {
  const { workspaceId, generationJobId } = await params;

  const jobResult = await getGenerationJob(workspaceId, generationJobId);
  if (jobResult.status === "error") {
    return <PageError title="Job unavailable" message={jobResult.message} />;
  }

  return <JobDetailClient workspaceId={workspaceId} job={jobResult.data} />;
}