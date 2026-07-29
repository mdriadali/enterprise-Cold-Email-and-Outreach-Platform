"use server";

import { callApi } from "../auth/api-client";

export type UpdateSmtpResult = { status: "success" } | { status: "error"; message: string };

export async function updateSmtpAccount(workspaceId: string, accountId: string, formData: FormData): Promise<UpdateSmtpResult> {
  const data: Record<string, string | undefined> = {};
  const fields = ["name", "host", "port", "username", "password", "fromName", "fromEmail", "replyTo", "encryption"];
  for (const f of fields) {
    const v = formData.get(f);
    if (typeof v === "string" && v.trim()) data[f] = v;
  }
  return callApi({ method: "PUT", url: `workspace/${workspaceId}/smtpaccount/${accountId}`, data: { data } });
}
