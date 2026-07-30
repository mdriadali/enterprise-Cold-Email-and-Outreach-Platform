import { CampaignStatus } from "@repo/db";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";
import type { SchudleCampaignUseCase } from "./scheduleCampaignUseCase";
import type { PausedCampaignUseCase } from "./pausedcampaign-usecase";
import type { DraftCampiagnUseCase } from "./draftcampaign-useCase";

export class UpdateCampaignStatusUseCase {
    constructor(
        private readonly schudleCampaignUseCase: SchudleCampaignUseCase,
        private readonly pausedCampaignUseCase: PausedCampaignUseCase,
        private readonly draftCampiagnUseCase: DraftCampiagnUseCase
    ) { }
    async execute(workspaceId: string, campaignId: string, status: CampaignStatus) {
        CampaignValidator.validateUpdateStatusInput(campaignId, status)

        switch (status) {

            case CampaignStatus.DRAFT:
                return await this.draftCampiagnUseCase.execute(workspaceId, campaignId)

            case CampaignStatus.SCHEDULED:
                return await this.schudleCampaignUseCase.execute(workspaceId, campaignId)

            case CampaignStatus.PAUSED:
                return await this.pausedCampaignUseCase.execute(workspaceId, campaignId)
        }
    }
}