"use server";

import { z } from "zod";
import type {
  AdminCampaignResponse,
  CampaignStatus,
} from "@repo/types";
import { callApi } from "../auth/api-client";

export interface AdminCampaignsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type AdminCampaignsResult =
  | {
      status: "success";
      data: AdminCampaignResponse[];
      pagination: AdminCampaignsPagination;
    }
  | { status: "error"; message: string };

const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * GET /admin/campaigns — paginated, system-wide outreach campaign
 * orchestrator directory across all tenant workspaces.
 */
export async function listAdminCampaigns(options: {
  page?: number;
  limit?: number;
} = {}): Promise<AdminCampaignsResult> {
  try {
    const parsed = listCampaignsQuerySchema.parse(options);

    const result = await callApi({
      method: "GET",
      url: `admin/campaigns?page=${parsed.page}&limit=${parsed.limit}`,
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

    const data: AdminCampaignResponse[] = rawRows.map((row) => {
      const campaign = row as Record<string, unknown>;
      return {
        id: campaign.id as string,
        name: campaign.name as string,
        status: campaign.status as CampaignStatus,
        workspaceId: campaign.workspaceId as string,
        workspaceName: campaign.workspaceName as string,
        createdById: campaign.createdById as string,
        createdByName: campaign.createdByName as string,
        createdAt: campaign.createdAt ? new Date(campaign.createdAt as string) : new Date(),
        updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt as string) : new Date(),
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
