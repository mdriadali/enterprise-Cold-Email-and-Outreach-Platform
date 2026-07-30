import type { ICampaignRepository } from "@repo/ports";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";

export class FindCampaignuseCase {
    constructor(
        private readonly campaignRepository: ICampaignRepository
    ) { }
    async execute(campaignId: string, workspaceId: string) {
        const campign = await this.campaignRepository.findByIdAndWorkspaceId(campaignId,workspaceId)
        CampaignValidator.validateCampaignData(campign)
        return campign
    }
}