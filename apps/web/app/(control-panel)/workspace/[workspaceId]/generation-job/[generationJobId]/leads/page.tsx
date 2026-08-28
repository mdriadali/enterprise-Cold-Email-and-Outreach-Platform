import { LeadsClient } from "./leads-client";
import { getGenerationJob } from "../../../../../../src/actions/workspace/get-generation-job";
import { getLeads } from "../../../../../../src/actions/workspace/get-leads";
import { PageError } from "@repo/ui/page-error";

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
    return <PageError title="Job unavailable" message={jobResult.message} />;
  }
  if (leadsResult.status === "error") {
    return <PageError title="Leads unavailable" message={leadsResult.message} />;
  }

  return (
    <LeadsClient
      workspaceId={workspaceId}
      generationJobId={generationJobId}
      currentPage={page}
      job={jobResult.data}
      leads={leadsResult.data}
    />
  );
}