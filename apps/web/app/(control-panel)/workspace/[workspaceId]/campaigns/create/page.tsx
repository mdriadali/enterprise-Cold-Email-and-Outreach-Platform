import { PageError } from "@repo/ui/page-error";
import { getWorkspaceInfo } from "../../../../../src/actions/workspace/workspace-info";
import { getSmtpAccounts } from "../../../../../src/actions/workspace/get-smtp-accounts";
import { CreateCampaignClient } from "./create-campaign-client";

export const metadata = { title: "Create Campaign | ColdReach AI" };

export default async function CreateCampaignPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;

  const [infoResult, smtpResult] = await Promise.all([
    getWorkspaceInfo(workspaceId),
    getSmtpAccounts(workspaceId),
  ]);

  if (infoResult.status === "error") {
    return <PageError title="Workspace unavailable" message={infoResult.message} />;
  }

  const generationJobs = infoResult.data.info.generationJob ?? [];
  const smtpAccounts = smtpResult.status === "success" ? smtpResult.accounts : [];

  return <CreateCampaignClient workspaceId={workspaceId} generationJobs={generationJobs} smtpAccounts={smtpAccounts} />;
}
