"use server";

import { callApi } from "../auth/api-client";

export type DeleteGenerationJobResult = { status: "success"; id: string } | { status: "error"; message: string };

export async function deleteGenerationJob(workspaceId: string, jobId: string): Promise<DeleteGenerationJobResult> {
  const result = await callApi({
    method: "DELETE",
    url: `workspace/${workspaceId}/generationjob/${jobId}`,
  });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  const job = payload?.job as Record<string, unknown> | undefined;
  const deletedId = job?.id;

  if (typeof deletedId !== "string") {
    return { status: "error", message: "Job deleted but couldn't retrieve its ID." };
  }

  return { status: "success", id: deletedId };
}