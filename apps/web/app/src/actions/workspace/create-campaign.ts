"use server";

import { callApi } from "../auth/api-client";

export type CreateCampaignInput = {
  name: string;
  description?: string;
  timezone: string;
  startAt: string;
  endAt: string;
  dailyLimit: number;
  sendingFromHour: number;
  sendingToHour: number;
  randomDelayMin: number;
  followUpEnabled: boolean;
  stopOnReply: boolean;
  stopOnBounce: boolean;
  smtpAccountId: string;
  generationJobId?: string;
  emails?: {
    email: string;
    subject: string;
    greeting: string;
    body: string;
    signature: string;
  }[];
};

export type CampaignCreatedData = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: string;
  timezone: string;
  startAt: string;
  endAt: string;
  dailyLimit: number;
  sendingFromHour: number | null;
  sendingToHour: number | null;
  nextRunAt: string | null;
  randomDelayMin: number | null;
  followUpEnabled: boolean;
  stopOnReply: boolean;
  stopOnBounce: boolean;
  createdById: string;
  smtpAccountId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCampaignResult =
  | { status: "success"; campaign: CampaignCreatedData }
  | { status: "error"; message: string };

export async function createCampaign(
  workspaceId: string,
  input: CreateCampaignInput
): Promise<CreateCampaignResult> {
  const result = await callApi({
    method: "POST",
    url: `workspace/${workspaceId}/campaign/create`,
    data: input,
  });
  if (result.status === "error") return result;

  const campaign = result.data as Record<string, unknown>;
  if (!campaign || !campaign.id) {
    return { status: "error", message: "Campaign created but could not retrieve its data." };
  }

  return { status: "success", campaign: campaign as unknown as CampaignCreatedData };
}
