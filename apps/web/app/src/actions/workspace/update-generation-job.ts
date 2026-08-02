"use server";

import { callApi } from "../auth/api-client";

export type UpdateGenerationJobResult = { status: "success"; job: { id: string; name: string } } | { status: "error"; message: string };

export async function updateGenerationJob(workspaceId: string, jobId: string, name: string): Promise<UpdateGenerationJobResult> {
  if (name.trim().length < 2) {
    return { status: "error", message: "Job name must be at least 2 characters." };
  }

  const result = await callApi({
    method: "PUT",
    url: `workspace/${workspaceId}/generationjob/${jobId}`,
    data: { name: name.trim() },
  });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  const job = payload?.job as Record<string, unknown> | undefined;

  if (!job || typeof job.id !== "string" || typeof job.name !== "string") {
    return { status: "error", message: "Job renamed but couldn't retrieve its details." };
  }

  return { status: "success", job: { id: job.id, name: job.name } };
}