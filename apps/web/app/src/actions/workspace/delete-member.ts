"use server";

import { callApi } from "../auth/api-client";

export type RemovedMember = {
  id: string;
  workspaceId: string;
  userId: string;
  role: string;
  createdAt: string;
};

export type DeleteMemberResult =
  | { status: "success"; data: RemovedMember }
  | { status: "error"; message: string };

export async function deleteMember(workspaceId: string, memberId: string): Promise<DeleteMemberResult> {
  const result = await callApi({ method: "DELETE", url: `workspace/${workspaceId}/member/${memberId}` });
  if (result.status === "error") return result;

  return { status: "success", data: result.data as RemovedMember };
}
