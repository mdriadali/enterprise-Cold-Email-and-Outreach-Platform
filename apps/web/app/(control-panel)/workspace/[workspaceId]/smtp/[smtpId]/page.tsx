import { notFound } from "next/navigation";
import { getSmtpAccounts } from "../../../../../src/actions/workspace/get-smtp-accounts";
import { SmtpDetailClient } from "./smtp-detail-client";

export const metadata = { title: "Edit SMTP Account | ColdReach AI" };

export default async function SmtpDetailPage({ params }: { params: Promise<{ workspaceId: string; smtpId: string }> }) {
  const { workspaceId, smtpId } = await params;
  const result = await getSmtpAccounts(workspaceId);
  if (result.status === "error") notFound();
  const account = result.accounts.find((a) => a.id === smtpId);
  if (!account) notFound();
  return <SmtpDetailClient workspaceId={workspaceId} account={account} />;
}
