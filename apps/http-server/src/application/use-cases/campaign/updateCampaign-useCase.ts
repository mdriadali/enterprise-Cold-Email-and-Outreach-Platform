import type { Updatecampaign } from "@repo/types";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";
import type { ICampaignRepository } from "@repo/ports";

export class UpdateCampaignUseCase {
constructor(
    private readonly  campaignRepository : ICampaignRepository 
){}
    async execute(workspaceId: string, id: string, data: Updatecampaign) {
        CampaignValidator.validateUpdateData(data)
        const campaign=await this.campaignRepository.findByIdAndWorkspaceId(id,workspaceId)
        CampaignValidator.isStatusDraft(campaign)
        await this.campaignRepository.updatebyIdAndWorkspaceId(id,workspaceId,data)
    }
}