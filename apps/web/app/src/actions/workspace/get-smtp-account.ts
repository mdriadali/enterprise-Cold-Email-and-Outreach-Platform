"use server";

import { callApi } from "../auth/api-client";

export type SmtpAccountInfo = {
  id: string;
  workspaceId: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo: string | null;
  encryption: string;
  error: string | null;
  isActive: boolean;
  createdAt: string;
};

export async function getSmtpAccount(workspaceId: string, smtpId: string): Promise<{ status: "success"; account: SmtpAccountInfo } | { status: "error"; message: string; code?: string }> {
  const result = await callApi({ method: "GET", url: `workspace/${workspaceId}/smtpaccount/${smtpId}` });
  if (result.status === "error") return result;
  return { status: "success", account: result.data as SmtpAccountInfo };
}
