"use server";

import { callApi } from "../auth/api-client";

export type BulkLeadRow = {
  email: string;
  metadata: Record<string, string>;
};

export type BulkCreateResult =
  | { status: "success"; count: number }
  | { status: "error"; message: string };

export async function bulkCreateLeads(
  workspaceId: string,
  generationJobId: string,
  leads: BulkLeadRow[],
): Promise<BulkCreateResult> {
  if (!leads.length) return { status: "error", message: "No leads provided." };

  const result = await callApi({
    method: "POST",
    url: `workspace/${workspaceId}/generationjob/${generationJobId}/lead/bulk-create`,
    data: { leads },
  });

  if (result.status === "error") return result;

  const data = result.data as { count?: { count?: number } } | undefined;
  const count = data?.count?.count ?? leads.length;
  return { status: "success", count };
}
