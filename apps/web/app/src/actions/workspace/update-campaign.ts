"use server";

import { callApi } from "../auth/api-client";
import type { CampaignDetail } from "./get-campaign";

export type UpdateCampaignData = {
  name?: string;
  description?: string | null;
  timezone?: string;
  startAt?: string | null;
  endAt?: string | null;
  dailyLimit?: number;
  sendingFromHour?: number | null;
  sendingToHour?: number | null;
  randomDelayMin?: number | null;
  followUpEnabled?: boolean;
  stopOnReply?: boolean;
  stopOnBounce?: boolean;
  smtpAccountId?: string;
};

export type UpdateCampaignResult =
  | { status: "success"; data: CampaignDetail }
  | { status: "error"; message: string };

export async function updateCampaign(
  workspaceId: string,
  campaignId: string,
  data: UpdateCampaignData,
): Promise<UpdateCampaignResult> {
  const result = await callApi({
    method: "PUT",
    url: `workspace/${workspaceId}/campaign/${campaignId}`,
    data: { data },
  });
  if (result.status === "error") return result;
  const campaign = result.data as CampaignDetail | undefined;
  if (!campaign || !campaign.id) {
    return { status: "error", message: "Campaign not found." };
  }
  return { status: "success", data: campaign };
}
