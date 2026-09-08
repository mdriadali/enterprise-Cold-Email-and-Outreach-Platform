"use server";

import { z } from "zod";
import type {
  AdminWorkspaceResponse,
  CampaignStatus,
  Subscription,
  WorkspaceMemberRole,
} from "@repo/types";
import { callApi } from "../auth/api-client";

export interface AdminWorkspacesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type AdminWorkspacesResult =
  | {
      status: "success";
      data: AdminWorkspaceResponse[];
      pagination: AdminWorkspacesPagination;
    }
  | { status: "error"; message: string };

const listWorkspacesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * GET /admin/workspaces — paginated system-wide tenant directory.
 */
export async function listAdminWorkspaces(options: {
  page?: number;
  limit?: number;
} = {}): Promise<AdminWorkspacesResult> {
  try {
    const parsed = listWorkspacesQuerySchema.parse(options);

    const result = await callApi({
      method: "GET",
      url: `admin/workspaces?page=${parsed.page}&limit=${parsed.limit}`,
    });

    if (result.status === "error") {
      return { status: "error", message: result.message };
    }

    const body = result.data as Record<string, unknown>;
    const rawRows = body.data as unknown[];
    const pagination = body.pagination as {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };

    if (!Array.isArray(rawRows) || !pagination) {
      return { status: "error", message: "Unexpected response from server." };
    }

    const data: AdminWorkspaceResponse[] = rawRows.map((row) => {
      const workspace = row as Record<string, unknown>;
      return {
        id: workspace.id as string,
        name: workspace.name as string,
        ownerId: workspace.ownerId as string,
        ownerName: workspace.ownerName as string,
        ownerEmail: workspace.ownerEmail as string,
        subscription: workspace.subscription as AdminWorkspaceResponse["subscription"],
        membersCount: workspace.membersCount as number,
        campaignsCount: workspace.campaignsCount as number,
        generationJobsCount: workspace.generationJobsCount as number,
        smtpAccountsCount: workspace.smtpAccountsCount as number,
        aiApiKeysCount: workspace.aiApiKeysCount as number,
      };
    });

    return {
      status: "success",
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    };
  } catch {
    return { status: "error", message: "Invalid input" };
  }
}

export interface AdminWorkspaceDetailData {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  subscription: Subscription;
  members: {
    id: string;
    role: WorkspaceMemberRole;
    userId: string;
    userName: string;
    userEmail: string;
  }[];
  campaigns: {
    id: string;
    name: string;
    status: CampaignStatus;
    createdAt: Date;
  }[];
  _count: {
    members: number;
    generationJob: number;
    AiApiKeys: number;
    smtpAccounts: number;
    campaign: number;
  };
}

export type AdminWorkspaceDetailResult =
  | { status: "success"; data: AdminWorkspaceDetailData }
  | { status: "error"; message: string };

/**
 * GET /admin/workspaces/:id — full tenant workspace detail with owner,
 * members, campaigns, and resource aggregates.
 */
export async function getWorkspaceAdminDetail(
  workspaceId: string
): Promise<AdminWorkspaceDetailResult> {
  try {
    if (!workspaceId || typeof workspaceId !== "string") {
      return { status: "error", message: "Invalid workspace ID." };
    }

    const result = await callApi({
      method: "GET",
      url: `admin/workspaces/${encodeURIComponent(workspaceId)}`,
    });

    if (result.status === "error") {
      return { status: "error", message: result.message };
    }

    const workspace = result.data as Record<string, unknown>;

    if (!workspace || typeof workspace.id !== "string") {
      return { status: "error", message: "Workspace not found." };
    }

    const owner = workspace.owner as Record<string, unknown> | undefined;
    const rawMembers = workspace.members as unknown[] | undefined;
    const rawCampaigns = workspace.campaigns as unknown[] | undefined;
    const counts = workspace._count as Record<string, unknown> | undefined;

    const data: AdminWorkspaceDetailData = {
      id: workspace.id as string,
      name: workspace.name as string,
      subscription: workspace.subscription as Subscription,
      owner: {
        id: owner?.id as string,
        name: owner?.name as string,
        email: owner?.email as string,
      },
      members: (rawMembers ?? []).map((member) => {
        const m = member as Record<string, unknown>;
        return {
          id: m.id as string,
          role: m.role as WorkspaceMemberRole,
          userId: m.userId as string,
          userName: m.userName as string,
          userEmail: m.userEmail as string,
        };
      }),
      campaigns: (rawCampaigns ?? []).map((campaign) => {
        const c = campaign as Record<string, unknown>;
        return {
          id: c.id as string,
          name: c.name as string,
          status: c.status as CampaignStatus,
          createdAt: c.createdAt ? new Date(c.createdAt as string) : new Date(),
        };
      }),
      _count: {
        members: counts?.members as number ?? 0,
        generationJob: counts?.generationJob as number ?? 0,
        AiApiKeys: counts?.AiApiKeys as number ?? 0,
        smtpAccounts: counts?.smtpAccounts as number ?? 0,
        campaign: counts?.campaign as number ?? 0,
      },
    };

    return { status: "success", data };
  } catch {
    return { status: "error", message: "Could not load workspace details." };
  }
}