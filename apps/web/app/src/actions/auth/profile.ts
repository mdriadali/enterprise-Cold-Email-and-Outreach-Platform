"use server";

import { callApi } from "./api-client";

export type WorkspaceMember = {
  id: string;
  workspaceId: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  createdAt: string;
  name?: string;
  activeCampaigns?: number;
  totalLeads?: number;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  workspaceMember: WorkspaceMember[];
};

export type ProfileResult = { status: "success"; data: Profile } | { status: "error"; message: string };

export async function getCurrentUserProfile(): Promise<ProfileResult> {
  const result = await callApi({ method: "GET", url: "user/profile" });
  if (result.status === "error") return result;

  const data = (result.data as Record<string, unknown>)?.data;
  if (!isProfile(data)) return { status: "error", message: "We couldn't load your profile." };
  return { status: "success", data };
}

function isProfile(value: unknown): value is Profile {
  return typeof value === "object" && value !== null && "id" in value && "name" in value && "email" in value && "role" in value
    && typeof value.id === "string" && typeof value.name === "string" && typeof value.email === "string" && typeof value.role === "string";
}

export type UpdateProfileResult = { status: "success"; data: Profile } | { status: "error"; message: string };

export async function updateProfile(name: string): Promise<UpdateProfileResult> {
  const result = await callApi({ method: "PATCH", url: "user/profile", data: { name } });
  if (result.status === "error") return result;

  const data = (result.data as Record<string, unknown>)?.updateData;
  if (!isProfile(data)) return { status: "error", message: "We couldn't update your profile." };
  return { status: "success", data };
}
