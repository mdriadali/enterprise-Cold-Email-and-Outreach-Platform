"use server";

import { callApi } from "../auth/api-client";

export type DeleteApiKeyResult = { status: "success"; id: string } | { status: "error"; message: string };

export async function deleteApiKey(workspaceId: string, id: string): Promise<DeleteApiKeyResult> {
  const result = await callApi({
    method: "DELETE",
    url: `workspace/${workspaceId}/aiapi/${id}`,
  });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  const apiData = payload?.apiData as Record<string, unknown> | undefined;
  const deletedId = apiData?.id;

  if (typeof deletedId !== "string") {
    return { status: "error", message: "Key deleted but couldn't retrieve its ID." };
  }

  return { status: "success", id: deletedId };
}