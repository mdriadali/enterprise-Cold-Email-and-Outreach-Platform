import { notFound, redirect } from "next/navigation";
import { getSmtpAccounts } from "../../../../src/actions/workspace/get-smtp-accounts";
import { SmtpClient } from "./smtp-client";

export const metadata = { title: "SMTP Accounts | ColdReach AI" };

export default async function SmtpPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const result = await getSmtpAccounts(workspaceId);
  if (result.status === "error") {
    if (result.code === "NOT_WORKSPACE_MEMBER") redirect("/workspaces");
    notFound();
  }
  return <SmtpClient workspaceId={workspaceId} accounts={result.accounts} />;
}
