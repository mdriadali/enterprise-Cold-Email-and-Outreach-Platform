"use server";

import { callApi } from "../auth/api-client";
import type { CampaingEmailData } from "@repo/types";

export type GetCampaignEmailsResult =
  | { status: "success"; data: CampaingEmailData[] }
  | { status: "error"; message: string };

export async function getCampaignEmails(
  workspaceId: string,
  campaignId: string,
): Promise<GetCampaignEmailsResult> {
  const result = await callApi({
    method: "GET",
    url: `workspace/${workspaceId}/campaign/${campaignId}/emails/all`,
  });
  if (result.status === "error") return result;

  return { status: "success", data: result.data as CampaingEmailData[] };
}
