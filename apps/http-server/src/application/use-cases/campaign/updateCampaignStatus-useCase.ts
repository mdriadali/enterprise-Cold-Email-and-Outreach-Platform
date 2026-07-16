import { CampaignStatus } from "@repo/db";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";
import type { ICampaignRepository } from "@repo/ports";
import type { SchudleCampaignUseCase } from "./scheduleCampaignUseCase";

export class UpdateCampaignStatusUseCase {
    constructor(
        private readonly schudleCampaignUseCase:SchudleCampaignUseCase
    ) { }
    async execute(workspaceId: string, campaignId: string, status: CampaignStatus) {
        CampaignValidator.validateUpdateStatusInput(campaignId, status)

        switch (status) {

            case CampaignStatus.SCHEDULED:
                return this.schudleCampaignUseCase.execute(workspaceId,campaignId)

            case CampaignStatus.PAUSED:
                return

            case CampaignStatus.CANCELLED:
                return
        }
    }
}