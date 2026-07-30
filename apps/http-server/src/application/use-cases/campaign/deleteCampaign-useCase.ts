import type { ICampaignEmailRepository, ICampaignqueue, ICampaignRepository } from "@repo/ports";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";

export class DeleteCampaignUseCase {
    constructor(
        private readonly campaignRepository: ICampaignRepository,
        private readonly campaignqueue: ICampaignqueue,
        private readonly campaignEmailRepository: ICampaignEmailRepository
    ) { }
    async execute(workspaceId: string, campaignId: string, userId: string) {
        const campaign = await this.campaignRepository.findByIdAndWorkspaceId(campaignId, workspaceId)

        CampaignValidator.isStatusDraft(campaign)

        await this.campaignEmailRepository.delete(campaignId, workspaceId)
        const remove = await this.campaignRepository.delete(campaignId, workspaceId, userId)
        CampaignValidator.validateCampaignData(remove)
        await this.campaignqueue.removeMailSendQueue(campaignId)
        return remove
    }
}