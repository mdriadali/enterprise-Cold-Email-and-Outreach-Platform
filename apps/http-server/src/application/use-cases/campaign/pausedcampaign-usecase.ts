import type { ICampaignqueue, ICampaignRepository } from "@repo/ports";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";

export class PausedCampaignUseCase {
    constructor(
        private readonly campaignRepository: ICampaignRepository,
        private readonly campaignqueue: ICampaignqueue
    ) { }

    async execute(workspaceId: string, campaignId: string) {
        const campaign = await this.campaignRepository.findByIdAndWorkspaceId(campaignId, workspaceId)

        CampaignValidator.alredyThisStatus(campaign, "COMPLETED", "campaign Already Completed")
        
        CampaignValidator.alredyThisStatus(campaign, "PAUSED")

        CampaignValidator.alredyThisStatus(campaign, "DRAFT", "You can not paused this campaign")

        const updatedCampaign = await this.campaignRepository.updateStatus(
            campaignId,
            workspaceId,
            "PAUSED"
        );

        CampaignValidator.validateCampaignData(updatedCampaign)

        await this.campaignqueue.removeMailSendQueue(campaignId)

        return updatedCampaign;
    }
}