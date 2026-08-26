import { notFound, redirect } from "next/navigation";
import { getGenerationJob } from "../../../../../src/actions/workspace/get-generation-job";
import { getLeads } from "../../../../../src/actions/workspace/get-leads";
import { JobDetailClient } from "./job-detail-client";

export const metadata = { title: "Job Details | ColdReach AI" };

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; generationJobId: string }>;
}) {

  const { workspaceId, generationJobId } = await params;

  const [jobResult, leadsResult] = await Promise.all([
    getGenerationJob(workspaceId, generationJobId),
    getLeads(workspaceId, generationJobId),
  ]);
  console.log("start job")
  console.log(jobResult)
  if (jobResult.status === "error") {
    if (jobResult.code === "NOT_WORKSPACE_MEMBER") redirect("/workspaces");
    notFound();
  }

  return (
    <JobDetailClient
      workspaceId={workspaceId}
      job={jobResult.data}
      leads={leadsResult.status === "success" ? leadsResult.data : []}
    />
  );
}
