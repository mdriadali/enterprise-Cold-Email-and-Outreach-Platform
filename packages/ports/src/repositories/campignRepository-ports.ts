import type { CampaignData, CreateCampaignInput } from "@repo/types";

export interface ICampaignRepository {
    create(data:CreateCampaignInput): Promise<CampaignData >
}