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

export async function getSmtpAccounts(workspaceId: string): Promise<{ status: "success"; accounts: SmtpAccountInfo[] } | { status: "error"; message: string; code?: string }> {
  const result = await callApi({ method: "GET", url: `workspace/${workspaceId}/smtpaccount/all` });
  if (result.status === "error") return result;
  const accounts = Array.isArray(result.data) ? result.data as SmtpAccountInfo[] : [];
  return { status: "success", accounts };
}
