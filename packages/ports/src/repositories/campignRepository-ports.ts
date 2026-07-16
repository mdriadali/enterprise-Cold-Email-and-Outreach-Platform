import type { CampaignStatus } from "@repo/db";
import type { CampaignData, CreateCampaignInput } from "@repo/types";

export interface ICampaignRepository {
    create(data: CreateCampaignInput): Promise<CampaignData>
    updateStatus(campaignId: string, workspaceId: string, status: CampaignStatus): Promise<CampaignData>
    findByIdAndWorkspaceId(id: string, workspaceId: string): Promise<CampaignData | null>
    findByNextRunAtAndStatus(nextRunAt:Date, status: CampaignStatus): Promise<CampaignData[] | null>
}