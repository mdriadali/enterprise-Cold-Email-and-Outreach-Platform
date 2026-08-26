import { notFound, redirect } from "next/navigation";
import { getGenerationJob } from "../../../../../../src/actions/workspace/get-generation-job";
import { getLeads } from "../../../../../../src/actions/workspace/get-leads";
import { LeadsClient } from "./leads-client";

export const metadata = { title: "Leads Management | ColdReach AI" };

export default async function LeadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string; generationJobId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { workspaceId, generationJobId } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [jobResult, leadsResult] = await Promise.all([
    getGenerationJob(workspaceId, generationJobId),
    getLeads(workspaceId, generationJobId, page),
  ]);

  if (jobResult.status === "error") {
    if (jobResult.code === "NOT_WORKSPACE_MEMBER") redirect("/workspaces");
    notFound();
  }

  const leads = leadsResult.status === "success" ? leadsResult.data : [];

  return (
    <LeadsClient
      workspaceId={workspaceId}
      generationJobId={generationJobId}
      job={jobResult.data}
      leads={leads}
      currentPage={page}
    />
  );
}
