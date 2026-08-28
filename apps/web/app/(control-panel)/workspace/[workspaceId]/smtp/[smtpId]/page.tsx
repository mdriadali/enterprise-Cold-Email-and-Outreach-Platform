import { SmtpDetailClient } from "./smtp-detail-client";
import { getSmtpAccount } from "../../../../../src/actions/workspace/get-smtp-account";
import { PageError } from "@repo/ui/page-error";

export const metadata = { title: "Edit SMTP Account | ColdReach AI" };

export default async function SmtpDetailPage({ params }: { params: Promise<{ workspaceId: string; smtpId: string }> }) {
  const { workspaceId, smtpId } = await params;

  const result = await getSmtpAccount(workspaceId, smtpId);
  if (result.status === "error") {
    return <PageError title="Account unavailable" message={result.message} />;
  }

  return <SmtpDetailClient workspaceId={workspaceId} account={result.account} />;
}