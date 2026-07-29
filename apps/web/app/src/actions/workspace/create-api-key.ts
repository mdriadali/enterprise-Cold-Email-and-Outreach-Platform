"use server";

import { callApi } from "../auth/api-client";

const VALID_PROVIDERS = ["GEMINI", "GROQ", "OPENROUTER", "CEREBRAS"] as const;

export type CreateApiKeyResult = { status: "success"; apiData: { id: string } } | { status: "error"; message: string };

export async function createApiKey(workspaceId: string, formData: FormData): Promise<CreateApiKeyResult> {
  const provider = formData.get("provider");
  const key = formData.get("key");

  if (typeof provider !== "string" || !VALID_PROVIDERS.includes(provider as typeof VALID_PROVIDERS[number])) {
    return { status: "error", message: "Invalid provider. Must be one of: GEMINI, GROQ, OPENROUTER, CEREBRAS." };
  }

  if (typeof key !== "string" || key.trim().length === 0) {
    return { status: "error", message: "API key cannot be empty." };
  }

  const result = await callApi({ method: "POST", url: `workspace/${workspaceId}/aiapi/create`, data: { provider, key } });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  const apiData = payload?.apiData as Record<string, unknown> | undefined;
  const id = apiData?.id;

  if (typeof id !== "string") {
    return { status: "error", message: "Key created but couldn't retrieve its ID." };
  }

  return { status: "success", apiData: { id } };
}
