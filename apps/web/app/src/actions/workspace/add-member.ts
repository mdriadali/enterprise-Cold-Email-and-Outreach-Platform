"use server";

import { callApi } from "../auth/api-client";

export type AddMemberInput = {
  email: string;
  role: "MEMBER";
};

export type AddedMember = {
  id: string;
  workspaceId: string;
  userId: string;
  role: string;
  createdAt: string;
};

export type AddMemberResult =
  | { status: "success"; data: AddedMember }
  | { status: "error"; message: string };

export async function addMember(workspaceId: string, input: AddMemberInput): Promise<AddMemberResult> {
  const result = await callApi({ method: "POST", url: `workspace/${workspaceId}/member/add`, data: input });
  if (result.status === "error") return result;

  return { status: "success", data: result.data as AddedMember };
}
