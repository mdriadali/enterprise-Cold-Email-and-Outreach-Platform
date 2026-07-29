"use server";

import { callApi } from "../auth/api-client";

export type DeleteSmtpResult = { status: "success" } | { status: "error"; message: string };

export async function deleteSmtpAccount(workspaceId: string, accountId: string): Promise<DeleteSmtpResult> {
  return callApi({ method: "DELETE", url: `workspace/${workspaceId}/smtpaccount/${accountId}` });
}
