"use server";

import { callApi } from "../auth/api-client";

export type LeadInfo = {
  id: string;
  email: string;
  status: string;
  generatedEmailData?: Record<string, unknown> | null;
  createdAt: string;
};

export type GetLeadsResult =
  | { status: "success"; data: LeadInfo[] }
  | { status: "error"; message: string };

export async function getLeads(
  workspaceId: string,
  generationJobId: string,
  page = 1,
): Promise<GetLeadsResult> {
  const result = await callApi({
    method: "GET",
    url: `workspace/${workspaceId}/generationjob/${generationJobId}/lead/all?page=${page}`,
  });
  // console.log("leads",result)
  if (result.status === "error") return result;

  const data = result.data;
  if (Array.isArray(data)) {
    return { status: "success", data: data as LeadInfo[] };
  }

  return { status: "success", data: [] };
}
