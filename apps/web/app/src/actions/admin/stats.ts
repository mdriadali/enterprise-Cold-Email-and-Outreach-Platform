"use server";

import { callApi } from "../auth/api-client";

export interface AdminStatsData {
  totalUsers: number;
  totalAdmins: number;
  totalWorkspaces: number;
  totalCampaigns: number;
  totalGenerationJobs: number;
  totalLeads: number;
  totalSmtpAccounts: number;
  totalAiApiKeys: number;
  totalEmailsSent: number;
}

export type AdminStatsResult =
  | { status: "success"; data: AdminStatsData }
  | { status: "error"; message: string };

/**
 * GET /admin/stats — platform-wide aggregate resource and telemetry metrics.
 * The endpoint returns the stats object directly (not wrapped in { data }).
 */
export async function getAdminStats(): Promise<AdminStatsResult> {
  try {
    const result = await callApi({
      method: "GET",
      url: "admin/stats",
    });

    if (result.status === "error") {
      return { status: "error", message: result.message };
    }

    const stats = result.data as Record<string, unknown>;

    if (!stats || typeof stats.totalUsers !== "number") {
      return { status: "error", message: "Unexpected response from server." };
    }

    const data: AdminStatsData = {
      totalUsers: stats.totalUsers as number,
      totalAdmins: stats.totalAdmins as number,
      totalWorkspaces: stats.totalWorkspaces as number,
      totalCampaigns: stats.totalCampaigns as number,
      totalGenerationJobs: stats.totalGenerationJobs as number,
      totalLeads: stats.totalLeads as number,
      totalSmtpAccounts: stats.totalSmtpAccounts as number,
      totalAiApiKeys: stats.totalAiApiKeys as number,
      totalEmailsSent: stats.totalEmailsSent as number,
    };

    return { status: "success", data };
  } catch {
    return { status: "error", message: "Could not load platform statistics." };
  }
}