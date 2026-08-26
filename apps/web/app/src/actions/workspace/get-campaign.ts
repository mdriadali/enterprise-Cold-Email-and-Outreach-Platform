"use server";

import { callApi } from "../auth/api-client";

export type CampaignDetail = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: string;
  timezone: string;
  startAt: string | null;
  endAt: string | null;
  dailyLimit: number;
  sendingFromHour: number | null;
  sendingToHour: number | null;
  nextRunAt: string | null;
  randomDelayMin: number | null;
  randomDelayMax: number | null;
  followUpEnabled: boolean;
  stopOnReply: boolean;
  stopOnBounce: boolean;
  createdById: string;
  createdBy?: { id: string; name: string; email: string } | null;
  smtpAccountId: string;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetCampaignResult =
  | { status: "success"; data: CampaignDetail }
  | { status: "error"; message: string; code?: string };

export async function getCampaign(
  workspaceId: string,
  campaignId: string,
): Promise<GetCampaignResult> {
  const result = await callApi({
    method: "GET",
    url: `workspace/${workspaceId}/campaign/${campaignId}`,
  });
  if (result.status === "error") return result;

  const data = result.data as Record<string, unknown>;
  if (!data || !data.id) {
    return { status: "error", message: "Campaign not found." };
  }

  return { status: "success", data: data as unknown as CampaignDetail };
}
