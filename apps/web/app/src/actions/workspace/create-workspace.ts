"use server";

import { callApi } from "../auth/api-client";

export type CreateWorkspaceResult = { status: "success"; workspaceId: string } | { status: "error"; message: string };

export async function createWorkspace(formData: FormData): Promise<CreateWorkspaceResult> {
  const name = formData.get("name");
  const subscription = formData.get("subscription");

  if (typeof name !== "string" || name.trim().length < 2) {
    return { status: "error", message: "Workspace name must be at least 2 characters." };
  }

  if (typeof subscription !== "string" || !["STARTER", "PROFESSIONAL", "ULTRA"].includes(subscription)) {
    return { status: "error", message: "Invalid subscription plan selected." };
  }

  const result = await callApi({ method: "POST", url: "workspace/create", data: { name: name.trim(), subscription } });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  const workspace = (payload?.createworkspace as Record<string, unknown> | undefined)?.workspace as Record<string, unknown> | undefined;
  const workspaceId = workspace?.id;

  if (typeof workspaceId !== "string") {
    return { status: "error", message: "Workspace created but we couldn't retrieve its ID." };
  }

  return { status: "success", workspaceId };
}
