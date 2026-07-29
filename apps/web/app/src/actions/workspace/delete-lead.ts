"use server";

import { callApi } from "../auth/api-client";

export type DeleteLeadResult =
  | { status: "success" }
  | { status: "error"; message: string };

export async function deleteLead(workspaceId: string, generationJobId: string, leadId: string): Promise<DeleteLeadResult> {
  const result = await callApi({
    method: "DELETE",
    url: `workspace/${workspaceId}/generationjob/${generationJobId}/lead/${leadId}`,
  });
  if (result.status === "error") return result;
  return { status: "success" };
}