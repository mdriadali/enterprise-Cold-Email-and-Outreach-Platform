import { SmtpClient } from "./smtp-client";

export const metadata = { title: "SMTP Accounts | ColdReach AI" };

export default async function SmtpPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  return <SmtpClient workspaceId={workspaceId} />;
}
