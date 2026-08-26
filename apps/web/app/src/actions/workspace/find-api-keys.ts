"use server";

import { callApi } from "../auth/api-client";

export type FoundApiKey = {
  id: string;
  apiKey: string;
  aiProvider: "GEMINI" | "GROQ" | "OPENROUTER" | "CEREBRAS";
  status: "AVAILABLE" | "RATE_LIMITED" | "INVALID" | "DISABLED";
};

export type ApiKeySummary = {
  total: number;
  available: number;
  rateLimited: number;
  invalid: number;
};

export type FindApiKeysResult =
  | { status: "success"; data: { apis: FoundApiKey[]; summary: ApiKeySummary } }
  | { status: "error"; message: string; code?: string };

export async function findApiKeys(workspaceId: string): Promise<FindApiKeysResult> {
  const result = await callApi({ method: "GET", url: `workspace/${workspaceId}/aiapi/find` });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  const apis = payload?.apis as FoundApiKey[] | undefined;

  if (!Array.isArray(apis)) {
    return { status: "error", message: "We couldn't load API keys." };
  }

  const summary = (payload?.summary ?? {}) as Partial<ApiKeySummary>;

  return {
    status: "success",
    data: {
      apis,
      summary: {
        total: summary.total ?? apis.length,
        available: summary.available ?? 0,
        rateLimited: summary.rateLimited ?? 0,
        invalid: summary.invalid ?? 0,
      },
    },
  };
}