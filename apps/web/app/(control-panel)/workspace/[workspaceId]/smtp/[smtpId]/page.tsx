import { notFound, redirect } from "next/navigation";
import { getSmtpAccount } from "../../../../../src/actions/workspace/get-smtp-account";
import { SmtpDetailClient } from "./smtp-detail-client";

export const metadata = { title: "Edit SMTP Account | ColdReach AI" };

export default async function SmtpDetailPage({ params }: { params: Promise<{ workspaceId: string; smtpId: string }> }) {
  const { workspaceId, smtpId } = await params;
  const result = await getSmtpAccount(workspaceId, smtpId);
  if (result.status === "error") {
    if (result.code === "NOT_WORKSPACE_MEMBER") redirect("/workspaces");
    notFound();
  }
  return <SmtpDetailClient workspaceId={workspaceId} account={result.account} />;
}
