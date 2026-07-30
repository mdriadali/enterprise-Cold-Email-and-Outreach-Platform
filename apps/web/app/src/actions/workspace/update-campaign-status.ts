"use server";

import { callApi } from "../auth/api-client";
import type { CampaignDetail } from "./get-campaign";

export type UpdateCampaignStatusResult =
  | { status: "success"; data: CampaignDetail }
  | { status: "error"; message: string };

export async function updateCampaignStatus(
  workspaceId: string,
  campaignId: string,
  newStatus: "DRAFT" | "SCHEDULED" | "PAUSED" | "CANCELLED"
): Promise<UpdateCampaignStatusResult> {
  const result = await callApi({
    method: "PATCH",
    url: `workspace/${workspaceId}/campaign/${campaignId}/status`,
    data: { status: newStatus },
  });
  if (result.status === "error") return result;

  return { status: "success", data: result.data as CampaignDetail };
}
