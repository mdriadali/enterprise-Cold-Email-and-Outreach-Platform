"use server";

import { callApi } from "../auth/api-client";

export type GenerationJobDetail = {
  id: string;
  name: string;
  workspaceId: string;
  status: "PENDING" | "PAUSED" | "PROCESSING" | "COMPLETED" | "FAILED" | "WAITING_FOR_API_QUOTA";
  errorMessage?: string | null;
  totalLeads: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  createdAt: string;
  updatedAt: string;
};

export type GetGenerationJobResult =
  | { status: "success"; data: GenerationJobDetail }
  | { status: "error"; message: string; code?: string };

export async function getGenerationJob(
  workspaceId: string,
  generationJobId: string,
): Promise<GetGenerationJobResult> {
  console.log("get job")
  const result = await callApi({
    method: "GET",
    url: `workspace/${workspaceId}/generationjob/${generationJobId}`,
  });
  console.log(result)
  if (result.status === "error") return result;
console.log("generation job",result)
  const data = result.data as Record<string, unknown>;
  if (!data || !data.id) {
    return { status: "error", message: "Job not found." };
  }

  return { status: "success", data: data as unknown as GenerationJobDetail };
}
