"use server";

import { callApi } from "../auth/api-client";

export type AiApiKeyInfo = {
  id: string;
  aiProvider: "GEMINI" | "GROQ" | "OPENROUTER" | "CEREBRAS";
  status: "AVAILABLE" | "RATE_LIMITED" | "INVALID" | "DISABLED";
};

export type GenerationJobInfo = {
  id: string;
  name: string;
  status: "PENDING" | "PAUSED" | "PROCESSING" | "COMPLETED" | "FAILED" | "WAITING_FOR_API_QUOTA";
  totalLeads: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  createdAt: string;
};

export type WorkspaceInfoData = {
  name: string;
  id: string;
  ownerId: string;
  subscription: string;
  members: {
    id: string;
    role: string;
    user: { name: string; id: string; email: string };
  }[];
  generationJob: GenerationJobInfo[];
  AiApiKeys: AiApiKeyInfo[];
  _count: {
    members: number;
    generationJob: number;
    campaign: number;
    AiApiKeys: number;
    smtpAccounts: number;
  };
};

export type WorkspaceInfoResult = { status: "success"; data: { limits: Record<string, number>; info: WorkspaceInfoData } } | { status: "error"; message: string };

export async function getWorkspaceInfo(workspaceId: string): Promise<WorkspaceInfoResult> {
  const result = await callApi({ method: "GET", url: `workspace/${workspaceId}/info` });
  if (result.status === "error") return result;

  const payload = result.data as Record<string, unknown>;
  const limits = payload?.limits as Record<string, number> | undefined;
  const info = payload?.info as WorkspaceInfoData | undefined;

  if (!limits || !info || !info.id) {
    return { status: "error", message: "We couldn't load workspace information." };
  }

  return { status: "success", data: { limits, info } };
}
