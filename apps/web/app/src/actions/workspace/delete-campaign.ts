"use server";

import { callApi } from "../auth/api-client";
import type { CampaignDetail } from "./get-campaign";

export type DeleteCampaignResult =
  | { status: "success"; data: CampaignDetail }
  | { status: "error"; message: string };

export async function deleteCampaign(workspaceId: string, campaignId: string): Promise<DeleteCampaignResult> {
  const result = await callApi({ method: "DELETE", url: `workspace/${workspaceId}/campaign/${campaignId}` });
  if (result.status === "error") return result;

  return { status: "success", data: result.data as CampaignDetail };
}
