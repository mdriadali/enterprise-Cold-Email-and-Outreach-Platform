"use server";

import { callApi } from "../auth/api-client";

export type CreateLeadInput = {
  email: string;
  name?: string;
  companyName?: string;
  purpose: string;
  metadata?: Record<string, unknown>;
};

export type CreateLeadResult =
  | { status: "success"; lead: { id: string; email: string; status: string; createdAt: string } }
  | { status: "error"; message: string };

export async function createLead(
  workspaceId: string,
  generationJobId: string,
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  const result = await callApi({
    method: "POST",
    url: `workspace/${workspaceId}/generationjob/${generationJobId}/lead/create`,
    data: { leadData: input },
  });
  if (result.status === "error") return result;

  const data = result.data as Record<string, unknown>;
  const lead = data?.lead as Record<string, unknown> | undefined;
  if (!lead || !lead.id) {
    return { status: "error", message: "Lead created but could not retrieve its data." };
  }

  return { status: "success", lead: lead as { id: string; email: string; status: string; createdAt: string } };
}
