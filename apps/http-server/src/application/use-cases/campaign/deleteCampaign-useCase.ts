import type { ICampaignRepository } from "@repo/ports";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";

export class DeleteCampaignUseCase {
    constructor(
        private readonly campaignRepository: ICampaignRepository
    ) { }
    async execute(id: string, workspaceId: string, userId: string) {

        const campaign = await this.campaignRepository.findByIdAndWorkspaceId(id, workspaceId)
        CampaignValidator.isStatusDraft(campaign)

        const deleteCampaign = await this.campaignRepository.delete(id, workspaceId, userId)
        CampaignValidator.validateCampaignData(deleteCampaign)
        return deleteCampaign
    }
}