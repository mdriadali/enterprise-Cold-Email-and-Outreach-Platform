"use server";

import { callApi } from "../auth/api-client";

export type CreateGenerationJobResult = { status: "success"; generationJob: { id: string } } | { status: "error"; message: string };

export async function createGenerationJob(workspaceId: string, formData: FormData): Promise<CreateGenerationJobResult> {
  const name = formData.get("name");

  if (typeof name !== "string" || name.trim().length < 2) {
    return { status: "error", message: "Job name must be at least 2 characters." };
  }

  const result = await callApi({ method: "POST", url: `workspace/${workspaceId}/generationjob/create`, data: { name } });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  const generationJob = payload?.generationJob as Record<string, unknown> | undefined;
  const id = generationJob?.id;

  if (typeof id !== "string") {
    return { status: "error", message: "Job created but couldn't retrieve its ID." };
  }

  return { status: "success", generationJob: { id } };
}
