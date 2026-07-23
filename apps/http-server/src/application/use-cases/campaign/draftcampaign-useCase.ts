import type { ICampaignqueue, ICampaignRepository } from "@repo/ports";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";

export class DraftCampiagnUseCase {
    constructor(
        private readonly campaignRepository: ICampaignRepository,
    ) { }

    async execute(workspaceId: string, campaignId: string) {
        const campaign = await this.campaignRepository.findByIdAndWorkspaceId(campaignId, workspaceId)

        CampaignValidator.alredyThisStatus(campaign, "DRAFT")

        CampaignValidator.alredyThisStatus(campaign, "SCHEDULED", "Plese update status to Paused")
        CampaignValidator.alredyThisStatus(campaign, "QUEUED", "Plese update status to Paused")
        CampaignValidator.alredyThisStatus(campaign, "FAILED", "Plese update status to Paused")

        const updatedCampaign = await this.campaignRepository.updateStatus(
            campaignId,
            workspaceId,
            "DRAFT"
        );

        return updatedCampaign;
    }
}