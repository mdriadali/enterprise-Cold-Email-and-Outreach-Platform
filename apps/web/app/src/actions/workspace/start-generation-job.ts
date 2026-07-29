"use server";

import { callApi } from "../auth/api-client";

export type StartGenerationJobResult =
  | { status: "success"; jobid: string }
  | { status: "error"; message: string };

export async function startGenerationJob(
  workspaceId: string,
  generationJobId: string,
): Promise<StartGenerationJobResult> {
  const result = await callApi({
    method: "POST",
    url: `workspace/${workspaceId}/generationjob/${generationJobId}/start`,
    data: {},
  });
  if (result.status === "error") return result;
  const data = result.data as Record<string, unknown>;
  const jobid = data?.jobid;
  if (typeof jobid !== "string") {
    return { status: "error", message: "Job started but no job ID returned." };
  }
  return { status: "success", jobid };
}
