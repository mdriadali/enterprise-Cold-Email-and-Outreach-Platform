import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCampaign } from "../../../../../../src/actions/workspace/get-campaign";
import { getCampaignEmails } from "../../../../../../src/actions/workspace/get-campaign-emails";
import { CampaignEmailsClient } from "./campaign-emails-client";

export const metadata = { title: "Campaign Emails | ColdReach AI" };

export default async function CampaignEmailsPage({ params }: { params: Promise<{ workspaceId: string; campaignId: string }> }) {
  const { workspaceId, campaignId } = await params;

  const [campaignResult, emailsResult] = await Promise.all([
    getCampaign(workspaceId, campaignId),
    getCampaignEmails(workspaceId, campaignId),
  ]);

  if (campaignResult.status === "error") {
    if (campaignResult.code === "NOT_WORKSPACE_MEMBER") redirect("/workspaces");
    return <div className="p-[32px] text-[#ba1a1a]">Campaign not found.</div>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="p-[32px] h-full flex flex-col max-w-[1440px] mx-auto w-full">
        <Link
          href={`/workspace/${workspaceId}/campaigns/${campaignId}`}
          className="flex items-center gap-[8px] text-[#004ac6] font-semibold text-[12px] leading-[16px] uppercase tracking-wider hover:underline w-fit"
        >
          <ArrowLeft className="size-[18px]" />
          Back to {campaignResult.data.name}
        </Link>
        <div className="flex-1 min-h-0 mt-[24px]">
          <CampaignEmailsClient
          workspaceId={workspaceId}
          campaignId={campaignId}
          campaignName={campaignResult.data.name}
          initialEmails={emailsResult.status === "success" ? emailsResult.data : []}
        />
        </div>
      </div>
    </div>
  );
}
